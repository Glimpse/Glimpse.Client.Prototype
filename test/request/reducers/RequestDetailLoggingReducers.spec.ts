import { filtersReducer, messagesReducer } from '../../../src/request/reducers/RequestDetailLoggingReducer';

import { Action } from 'redux';

import * as chai from 'chai';

const should = chai.should();

describe('RequestDetailLoggingReducers', () => {

    function createLogMessage(level: string) {
        return {            
            level: level,
            message: 'message',
            isObject: false,
            spans: [
                {
                    text: 'message'
                }
            ]
        } 
    };
    
    function createRequest(messages?: ({ ordinal: number, id: string, type: string, payload })[]) {
        return {
            messages: messages.reduce((prev, current) => {
                    prev[current.id] = current;
                    
                    return prev;
                },
                {}),
            types: messages.reduce((prev, current) => {
                    const type = prev[current.type];
                    
                    if (!type) {
                        prev[current.type] = [ current.id ];
                    }
                    else {
                        type.push(current.id);                        
                    }
                    
                    return prev;
                },
                {})
        };
    }

    function createAction(type?: string, payload?): Action {
        return <Action>{
            type: type,
            payload: payload
        };
    }

    describe('#filtersReducer', () => {
        it('should default to the standard set of filters', () => {
            const state = undefined;
            const newState = filtersReducer(state, createAction());
            
            should.exist(newState);
            
            newState.should.deep.equal([
                { level: 'Critical', isShown: true },
                { level: 'Error', isShown: true },
                { level: 'Warning', isShown: true },
                { level: 'Information', isShown: true },
                { level: 'Verbose', isShown: true },
                { level: 'Debug', isShown: true }
            ]); 
        });
        
        it('should ignore actions not understood', () => {
            const state = [ { level: 'Critical', isShown: false } ];
            const newState = filtersReducer(state, createAction());
            
            should.exist(newState);
            
            newState.should.equal(state);
        })

        it('should toggle a true value to false', () => {
            const state = [
                { level: 'Critical', isShown: true },
                { level: 'Error', isShown: false }
            ];
            const newState = filtersReducer(state, createAction('request.detail.logging.toggle', 0));
            
            should.exist(newState);
            
            newState.should.deep.equal([
                { level: 'Critical', isShown: false },
                { level: 'Error', isShown: false }
            ]);
        });

        it('should toggle a false value to true', () => {
            const state = [
                { level: 'Critical', isShown: true },
                { level: 'Error', isShown: false }
            ];
            const newState = filtersReducer(state, createAction('request.detail.logging.toggle', 1));
            
            should.exist(newState);
            
            newState.should.deep.equal([
                { level: 'Critical', isShown: true },
                { level: 'Error', isShown: true }
            ]);
        });

        it('should set all filters to true on show-all', () => {
            const state = [
                { level: 'Critical', isShown: false },
                { level: 'Error', isShown: false }
            ];
            const newState = filtersReducer(state, createAction('request.detail.logging.all', 1));
            
            should.exist(newState);
            
            newState.should.deep.equal([
                { level: 'Critical', isShown: true },
                { level: 'Error', isShown: true }
            ]);
        });
        
        it('should ignore show-all if all are already shown', () => {
            const state = [
                { level: 'Critical', isShown: true },
                { level: 'Error', isShown: true }
            ];
            const newState = filtersReducer(state, createAction('request.detail.logging.all', 1));
            
            should.exist(newState);
            
            newState.should.equal(state);
        });
    });
    
    describe('#messagesReducer', () => {
        it('should default to no messages', () => {
            const state = undefined;
            const newState = messagesReducer(state, createAction());
            
            should.exist(newState);
            
            newState.length.should.equal(0);
        });
        
        it('should ignore actions not understood', () => {
            const state = [ 
                    createLogMessage('Debug')
            ];
            const newState = messagesReducer(state, createAction());
            
            should.exist(newState);
            
            newState.should.equal(state);
        });
        
        it('should add a logging message', () => {
            const state = [];
            const request = createRequest([
                {
                    ordinal: 1,
                    id: 'message1',
                    type: 'log-write',
                    payload: {
                        level: 'Debug',
                        message: 'message'
                    }
                }
            ]);
            
            const newState = messagesReducer(state, createAction('request.detail.update', request));
            
            should.exist(newState);

            newState.should.deep.equal([
                {
                    level: 'Debug',
                    message: 'message',
                    isObject: false,
                    spans: [
                        {
                            text: 'message'
                        }
                    ]
                }
            ]);            
        });

        it('should add a logged object', () => {
            const state = [];
            const request = createRequest([
                {
                    ordinal: 1,
                    id: 'message1',
                    type: 'log-write',
                    payload: {
                        level: 'Debug',
                        message: '{ key: \'value\' }'
                    }
                }
            ]);
            
            const newState = messagesReducer(state, createAction('request.detail.update', request));
            
            should.exist(newState);

            newState.should.deep.equal([
                {
                    level: 'Debug',
                    message: '{ key: \'value\' }',
                    isObject: true,
                    spans: [
                        {
                            text: '{ key: \'value\' }'
                        }
                    ]
                }
            ]);            
        });

        it('should add a spanned message', () => {
            const state = [];
            const request = createRequest([
                {
                    ordinal: 1,
                    id: 'message1',
                    type: 'log-write',
                    payload: {
                        level: 'Debug',
                        message: 'message',
                        replacedRegions: [
                            { start: 0, end: 7 }
                        ]
                    }
                }
            ]);
            
            const newState = messagesReducer(state, createAction('request.detail.update', request));
            
            should.exist(newState);

            newState.should.deep.equal([
                {
                    level: 'Debug',
                    message: 'message',
                    isObject: false,
                    spans: [
                        {
                            text: 'message',
                            wasReplaced: true
                        }
                    ]
                }
            ]);            
        });

        it('should concatenate and sort log messages', () => {
            const state = [];
            const request = createRequest([
                {
                    ordinal: 2,
                    id: 'message2',
                    type: 'log-write',
                    payload: {
                        level: 'Error',
                        message: 'error'
                    }
                },
                {
                    ordinal: 1,
                    id: 'message1',
                    type: 'log-write',
                    payload: {
                        level: 'Debug',
                        message: 'debug'
                    }
                }
            ]);
            
            const newState = messagesReducer(state, createAction('request.detail.update', request));
            
            should.exist(newState);

            newState.should.deep.equal([
                {
                    level: 'Debug',
                    message: 'debug',
                    isObject: false,
                    spans: [
                        {
                            text: 'debug'
                        }
                    ]
                },
                {
                    level: 'Error',
                    message: 'error',
                    isObject: false,
                    spans: [
                        {
                            text: 'error'
                        }
                    ]
                }
            ]);            
        });
    });
});
