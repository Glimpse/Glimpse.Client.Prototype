import { IRequestDetailUpdateAction } from '../actions/RequestDetailActions';

const processor = require('../util/request-message-processor');
 
import { Action, combineReducers } from 'redux';

function requestDetailDataTotalOperationCountReducer(state = 2, action: Action) {
    return state;    
}

function updateMessages(state, request) {
    if (request) {
        const options = {
            'data-mongodb-insert': processor.getTypeMessageList,
            'data-mongodb-read': processor.getTypeMessageList,
            'data-mongodb-update': processor.getTypeMessageList,
            'data-mongodb-delete': processor.getTypeMessageList
        };

        const processedMessages = processor.getTypeStucture(request, options);

        const allMessages = []
            .concat(processedMessages.dataMongodbInsert || [])
            .concat(processedMessages.dataMongodbRead || [])
            .concat(processedMessages.dataMongodbUpdate || [])
            .concat(processedMessages.dataMongodbDelete || []); 
    
        return allMessages;
    }
    
    return [];
}

function requestDetailDataMessagesReducer(state = [], action: IRequestDetailUpdateAction) {
    switch (action.type) {
        case 'request.detail.update': 
            return updateMessages(state, action.request);
    }
    
    return state;
}

export const requestDetailDataReducer = combineReducers({
    messages: requestDetailDataMessagesReducer,
    totalOperationCount: requestDetailDataTotalOperationCountReducer
});
