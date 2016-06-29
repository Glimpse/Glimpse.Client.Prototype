import { IMessage, IMessageEnvelope } from '../../../src/request/messages/IMessageEnvelope';
import { IMiddlewareStartPayload } from '../../../src/request/messages/IMiddlewareStartPayload';
import { IMiddlewareEndPayload } from '../../../src/request/messages/IMiddlewareEndPayload';
import { middlewareReducer } from '../../../src/request/reducers/RequestDetailRequestReducer';

import { Action } from 'redux';

import * as chai from 'chai';

const should = chai.should();

describe('RequestDetailRequestReducers', () => {

    function createRequest(messages?: IMessage[]) {
        return {
            messages: messages.reduce((prev, current) => {
                    prev[current.id] = current;
                    
                    return prev;
                },
                {}),
            types: messages.reduce((prev, current) => {
                    current.types.forEach(type => {
                        const types = prev[type];
                        
                        if (!types) {
                            prev[type] = [ current.id ];
                        }
                        else {
                            types.push(current.id);                        
                        }
                        });
                    
                    return prev;
                },
                {})
        };
    }

    function createMiddlewareStart(ordinal: number, correlationId: string, name: string, packageName: string): IMessageEnvelope<IMiddlewareStartPayload> {
        return {
            id: ordinal.toString(),
            ordinal: ordinal,
            types: [ 'middleware-start' ],
            payload: {
                correlationId: correlationId,
                name: name,
                displayName: '',
                packageName: packageName,
                startTime: ''
            }
        };
    }

    function createMiddlewareEnd(ordinal: number, correlationId: string, name: string, packageName: string, headers?: { name: string, op: string, value: string }[]): IMessageEnvelope<IMiddlewareEndPayload> {
        return {
            id: ordinal.toString(),
            ordinal: ordinal,
            types: [ 'middleware-end' ],
            payload: {
                correlationId: correlationId,
                name: name,
                displayName: '',
                packageName: packageName,
                endTime: '',
                duration: 1,
                headers: headers || [],
                result: ''
            }
        };
    }

    function createAction(type?: string, payload?): Action {
        return <Action>{
            type: type,
            payload: payload
        };
    }

    describe('#middlewareReducer', () => {
        it('should default to no middleware', () => {
            const state = undefined;
            const newState = middlewareReducer(state, createAction());

            should.exist(newState);
            newState.length.should.equal(0);
        });

        it('should ignore unrecognized actions', () => {
            const state = [];
            const newState = middlewareReducer(state, createAction());

            should.exist(newState);
            newState.should.equal(state);
        });

        it('should return middleware given a start and end message', () => {
            const state = [];
            const request = createRequest([
                createMiddlewareStart(1, 'one', 'name', 'package'),
                createMiddlewareEnd(2, 'one', 'name', 'package', [ { name: 'name', op: 'set', value: 'value' }])
            ]);
            const newState = middlewareReducer(state, createAction('request.detail.update', request));

            should.exist(newState);
            newState.should.deep.equal([
                {
                    name: 'name',
                    packageName: 'package',
                    headers: {
                        name: {
                            value: 'value',
                            wasSet: true
                        }
                    },
                    middleware: []
                }
            ]);
        });

        it('should return multiple serial middleware given start and end messages', () => {
            const state = [];
            const request = createRequest([
                createMiddlewareStart(1, 'one', 'name1', 'package1'),
                createMiddlewareEnd(2, 'one', 'name1', 'package1'),
                createMiddlewareStart(3, 'two', 'name2', 'package2'),
                createMiddlewareEnd(4, 'two', 'name2', 'package2')
            ]);
            const newState = middlewareReducer(state, createAction('request.detail.update', request));

            should.exist(newState);
            newState.should.deep.equal([
                {
                    name: 'name1',
                    packageName: 'package1',
                    headers: {},
                    middleware: []
                },
                {
                    name: 'name2',
                    packageName: 'package2',
                    headers: {},
                    middleware: []
                }
            ]);
        });

        it('should return nested middleware given nested start and end messages', () => {
            const state = [];
            const request = createRequest([
                createMiddlewareStart(1, 'one', 'name1', 'package1'),
                createMiddlewareStart(2, 'two', 'name2', 'package2'),
                createMiddlewareStart(3, 'three', 'name3', 'package3'),
                createMiddlewareEnd(4, 'three', 'name3', 'package3'),
                createMiddlewareEnd(5, 'two', 'name2', 'package2'),
                createMiddlewareStart(6, 'four', 'name4', 'package4'),
                createMiddlewareEnd(7, 'four', 'name4', 'package4'),
                createMiddlewareEnd(8, 'one', 'name1', 'package1')
            ]);
            const newState = middlewareReducer(state, createAction('request.detail.update', request));

            should.exist(newState);
            newState.should.deep.equal([
                {
                    name: 'name1',
                    packageName: 'package1',
                    headers: {},
                    middleware: [
                        {
                            name: 'name2',
                            packageName: 'package2',
                            headers: {},
                            middleware: [
                                {
                                    name: 'name3',
                                    packageName: 'package3',
                                    headers: {},
                                    middleware: []
                                }
                            ]
                        },
                        {
                            name: 'name4',
                            packageName: 'package4',
                            headers: {},
                            middleware: []
                        }
                    ]
                }
            ]);
        });
    });
});
