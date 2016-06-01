import { IRequestState } from '../stores/IRequestState';

import { createSelector } from 'reselect';
import * as _ from 'lodash';

export const getFilterState = (state: IRequestState) => state.detail.data.filters;
export const getOperations = (state: IRequestState) => state.detail.data.operations;
export const getSelectedOperationId = (state: IRequestState) => state.detail.data.selectedOperationId;

export const getTotalOperationCount = createSelector(
    getOperations,
    operations => {
        return operations.length;
    });

export const getFilteredOperations = createSelector(
    getFilterState,
    getOperations,
    (filterState, operations) => {
        const hiddenDatabases = _.keys(_.omitBy(filterState, isShown => isShown));
        
        let filteredOperations = [];
        
        operations.forEach((operation, index) => {
            if (!_.includes(hiddenDatabases, operation.database)) {
                filteredOperations.push({
                    ordinal: index + 1,
                    operation: operation
                })
            }
        });
        
        return filteredOperations;
    });

export const getSelectedOperation = createSelector(
    getFilteredOperations,
    getSelectedOperationId,
    (operations, selectedOperationId) => {
        // TODO: Can this (need this) be optimized by building a map of id --> operation?
        return _.find(operations, operation => operation.operation.id === selectedOperationId);
    });

export const getFilters = createSelector(
    getFilterState,
    getOperations,
    (filterState, operations) => {
        var databases = _.groupBy(operations, operation => operation.database);
        
        return _.sortBy(
            _.values<{ name: string, isShown: boolean, count: number}>(
                _.mapValues(
                    filterState, 
                    (filter, database) => {
                        const databaseOperations = databases[database];
                        
                        return {
                            name: database,
                            isShown: filter,
                            count: databaseOperations ? databaseOperations.length : 0
                        }
                    })),
            filter => filter.name);
    });
