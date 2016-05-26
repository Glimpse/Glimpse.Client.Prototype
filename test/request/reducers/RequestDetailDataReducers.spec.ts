import { IRequestDetailDataOperationState } from '../../../src/request/stores/IRequestDetailDataOperationState';
import { IRequestState } from '../../../src/request/stores/IRequestState';
import { selectedIndexReducer } from '../../../src/request/reducers/RequestDetailDataReducer';
import { Action } from 'redux';

import * as chai from 'chai';

const should = chai.should();

describe('RequestDetailDataReducer', () => {
    
    function createState(operations?: IRequestDetailDataOperationState[], selectedIndex?: number): IRequestState {
        return {
            detail: {
                data: {
                    operations: operations || [],
                    selectedIndex: selectedIndex || 0
                }
            }
        }
    }

    
    function createAction(type?: string, payload?): Action {
        return <Action>{
            type: type,
            payload: payload
        };
    }
    
    describe('#selectedIndexReducer', () => {
        it('should default to the first operation', () => {
            const state = undefined;
            const newState = selectedIndexReducer(state, createAction());
            
            should.exist(newState);
            newState.should.equal(0);
        });
        
        it('should reset its state when no request is selected', () => {
            const state = 1;
            const newState = selectedIndexReducer(state, createAction('request.detail.update', undefined));
            
            should.exist(newState);
            newState.should.equal(0);
        });

        it('should update its state to the selected operation', () => {
            const state = 1;
            const newState = selectedIndexReducer(state, createAction('request.detail.data.select', 2));
            
            should.exist(newState);
            newState.should.equal(2);
        });
    });
});
