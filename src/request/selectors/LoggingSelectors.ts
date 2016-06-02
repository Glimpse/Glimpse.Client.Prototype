import { IRequestState } from '../stores/IRequestState';

import { createSelector } from 'reselect';

import * as _ from 'lodash';

const getMessages = (state: IRequestState) => state.detail.logging.messages;

export const getFilters = (state: IRequestState) => state.detail.logging.filters;

export const getFilteredMessages = createSelector(
    getMessages, 
    getFilters,
    (messages, filters) => {
        const hiddenLevels = filters
            .filter(filterState => filterState.isShown === false)
            .map(filterState => filterState.level);
        
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
        return messages.length;
    });
