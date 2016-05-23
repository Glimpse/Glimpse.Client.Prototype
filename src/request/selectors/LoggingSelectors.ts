import { createSelector } from 'reselect';

const getMessages = (state) => state.get('messages');

export const getTotalMessageCount = createSelector(
    getMessages,
    (messages) => {
        return messages.count();
    });
