import { createSelector } from 'reselect';

import * as _ from 'lodash';
import * as Immutable from 'immutable';

const getMessages = (state) => state.get('messages');

export const getFilters = (state) => state.get('filters');

export const getFilteredMessages = createSelector(
    getMessages, 
    getFilters,
    (messages, filters) => {
        const hiddenLevels = filters
            .filter(filterState => filterState.get('isShown') === false)
            .map(filterState => filterState.get('level'))
            .toArray();
        
        let filteredMessages = [];
        
        messages.forEach((messageState, index) => {
            if (!_.includes(hiddenLevels, messageState.level)) {
                filteredMessages.push({ index: index + 1, message: messageState });
            }
        })
        
        return filteredMessages;
    }
);

export const getTotalMessageCount = createSelector(
    getMessages,
    (messages) => {
        return messages.count();
    });
