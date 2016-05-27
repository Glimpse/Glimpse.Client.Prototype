import { IRequestState } from '../stores/IRequestState';

import { createSelector } from 'reselect';
import * as _ from 'lodash';

export const getFilterState = (state: IRequestState) => state.detail.data.filters;
export const getOperations = (state: IRequestState) => state.detail.data.operations;
export const getSelectedIndex = (state: IRequestState) => state.detail.data.selectedIndex;

export const getTotalOperationCount = createSelector(
    getOperations,
    operations => {
        return operations.length;
    });

export const getSelectedOperation = createSelector(
    getOperations,
    getSelectedIndex,
    (operations, selectedIndex) => {
        return operations[selectedIndex];
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
