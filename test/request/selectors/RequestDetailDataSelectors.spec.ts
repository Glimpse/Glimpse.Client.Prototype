import { getFilteredOperations, getFilters, getTotalOperationCount, getSelectedOperation } from '../../../src/request/selectors/RequestDetailDataSelectors';
import { IRequestState } from '../../../src/request/stores/IRequestState';
import { IRequestDetailDataOperationState } from '../../../src/request/stores/IRequestDetailDataOperationState';

import * as chai from 'chai';

const should = chai.should();

describe('RequestDetailDataSelectors', () => {
    
    function createState(operations?: IRequestDetailDataOperationState[], selectedIndex?: number, filters?: { [key: string]: boolean }): IRequestState {
        return {
            detail: {
                data: {
                    filters: filters || {},
                    operations: operations || [],
                    selectedIndex: selectedIndex || 0
                }
            }
        }
    }
    
    function createOperation(index: number, database?: string): IRequestDetailDataOperationState {
        return {
            command: 'command' + index,
            database: database || 'db',
            duration: 123,
            operation: 'op' + index,
            recordCount: 456
        };
    }
    
    describe('#getTotalOperationCount', () => {
        it('should return zero for an empty operations collection', () => {
            const count = getTotalOperationCount(createState());
            
            count.should.equal(0);
        });

        it('should return the length of the operations collection', () => {
            const count = getTotalOperationCount(
                createState([
                    createOperation(0),
                    createOperation(1)
                ]));
            
            count.should.equal(2);
        });
    });
    
    describe('#getSelectedOperation', () => {
        it('should return the operation at the selected index', () => {
            const operation0 = createOperation(0);
            const operation1 = createOperation(1);
            const selectedOperation = getSelectedOperation(
                createState([
                    operation0,
                    operation1
                ],
                1));
            
            should.exist(selectedOperation);
            selectedOperation.should.deep.equal({
                ordinal: 2,
                operation: operation1
            });
        });      

        it('should return undefined if the selected index < 0', () => {
            const operation0 = createOperation(0);
            const operation1 = createOperation(1);
            const selectedOperation = getSelectedOperation(
                createState([
                    operation0,
                    operation1
                ],
                -1));
            
            should.not.exist(selectedOperation);
        });      

        it('should return undefined if the selected index > the operations collection\'s length', () => {
            const operation0 = createOperation(0);
            const operation1 = createOperation(1);
            const selectedOperation = getSelectedOperation(
                createState([
                    operation0,
                    operation1
                ],
                2));
            
            should.not.exist(selectedOperation);
        });      
    });
    
    describe('#getFilters', () => {
        it('should return zero counts for existing filters but no operations exist for current request', () => {
            const filters = getFilters(createState([], -1, { 'db': true }));
            
            should.exist(filters);
            filters.should.deep.equal([
                {
                    name: 'db',
                    isShown: true,
                    count: 0
                }
            ]);
        });

        it('should return counts for existing filters with existing operations for current request', () => {
            const filters = getFilters(createState([ createOperation(0) ], 0, { 'db': true }));
            
            should.exist(filters);
            filters.should.deep.equal([
                {
                    name: 'db',
                    isShown: true,
                    count: 1
                }
            ]);
        });

        it('should return filters in alphabetical order', () => {
            const filters = getFilters(createState([], 0, { 'db2': true, 'db1': true }));
            
            should.exist(filters);
            filters.should.deep.equal([
                {
                    name: 'db1',
                    isShown: true,
                    count: 0
                },
                {
                    name: 'db2',
                    isShown: true,
                    count: 0
                }
            ]);
        });
    });
    
    describe('#getFilteredOperations', () => {
        it('should return no operations when no operations exist', () => {
            const operations = getFilteredOperations(createState([], -1, { 'db': true }));
            
            should.exist(operations);
            operations.length.should.equal(0);
        });

        it('should return no operations when no databases are shown', () => {
            const operations = getFilteredOperations(createState([ createOperation(0) ], -1, { 'db': false }));
            
            should.exist(operations);
            operations.length.should.equal(0);
        });

        it('should return operations when databases are shown', () => {
            const operation0 = createOperation(0);
            const operations = getFilteredOperations(createState([ operation0 ], -1, { 'db': true }));
            
            should.exist(operations);
            operations.should.deep.equal([
                {
                    ordinal: 1,
                    operation: operation0
                }
            ]);
        });

        it('should return operations only for shown databases', () => {
            const operation0 = createOperation(0, 'db1');
            const operation1 = createOperation(0, 'db2');
            const operation2 = createOperation(0, 'db1');
            const operations = getFilteredOperations(createState([ operation0, operation1, operation2 ], -1, { 'db1': true, 'db2': false }));
            
            should.exist(operations);
            operations.should.deep.equal([
                {
                    ordinal: 1,
                    operation: operation0
                },
                {
                    ordinal: 3,
                    operation: operation2
                }
            ]);
        });
    });
});
