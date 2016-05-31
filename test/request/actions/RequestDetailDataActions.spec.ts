import { selectOperationAction, showAllAction, toggleFilterAction } from '../../../src/request/actions/RequestDetailDataActions';

import * as chai from 'chai';

const should = chai.should();

describe('RequestDetailDataActions', () => {
    describe('#selectOperationAction', () => {
        it('should return the selected index as payload', () => {
            const selectedIndex = 123;
            const action = selectOperationAction(selectedIndex);
            
            should.exist(action);
            action.should.deep.equal({
                type: 'request.detail.data.select',
                payload: selectedIndex
            });
        });
    });
    
    describe('#toggleFilterAction', () => {
        it('should return the filter name as payload', () => {
            const name = 'test';
            const action = toggleFilterAction(name);
            
            should.exist(action);
            action.should.deep.equal({
                type: 'request.detail.data.toggle',
                payload: name
            });
        });
    });
    
    describe('#showAllAction', () => {
        it('shoudl return a simple action', () => {
            const action = showAllAction();
            
            should.exist(action);
            action.should.deep.equal({
                type: 'request.detail.data.all'
            });
        });
    });
});
