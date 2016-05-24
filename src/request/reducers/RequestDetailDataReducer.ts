import { IRequestDetailUpdateAction } from '../actions/RequestDetailActions';

const processor = require('../util/request-message-processor');
 
import { Action, combineReducers } from 'redux';

function createMongoDbInsertOperation(message) {
    return {
        ordinal: message.ordinal,
        database: 'MongoDB',
        command: '',
        duration: message.payload.duration,
        operation: 'Insert',
        recordCount: message.payload.count
    };
}

function createMongoDbReadOperation(message) {
    return {
        ordinal: message.ordinal,
        database: 'MongoDB',
        command: '',
        duration: message.payload.duration,
        operation: 'Read',
        recordCount: undefined // NOTE: Read does not have a 'count' property.
    };
}

function createMongoDbUpdateOperation(message) {
    return {
        ordinal: message.ordinal,
        database: 'MongoDB',
        command: '',
        duration: message.payload.duration,
        operation: 'Update',
        recordCount: message.payload.modifiedCount + message.payload.upsertedCount
    };
}

function createMongoDbDeleteOperation(message) {
    return {
        ordinal: message.ordinal,
        database: 'MongoDB',
        command: '',
        duration: message.payload.duration,
        operation: 'Delete',
        recordCount: message.payload.count
    };
}

function updateOperations(state, request) {
    if (request) {
        const options = {
            'data-mongodb-insert': processor.getTypeMessageList,
            'data-mongodb-read': processor.getTypeMessageList,
            'data-mongodb-update': processor.getTypeMessageList,
            'data-mongodb-delete': processor.getTypeMessageList
        };

        const processedMessages = processor.getTypeStucture(request, options);

        const allOperations = []
            .concat((processedMessages.dataMongodbInsert || []).map(createMongoDbInsertOperation))
            .concat((processedMessages.dataMongodbRead || []).map(createMongoDbReadOperation))
            .concat((processedMessages.dataMongodbUpdate || []).map(createMongoDbUpdateOperation))
            .concat((processedMessages.dataMongodbDelete || []).map(createMongoDbDeleteOperation))
            .sort((a, b) => a.ordinal - b.ordinal); 
    
        return allOperations;
    }
    
    return [];
}

function requestDetailDataMessagesReducer(state = [], action: IRequestDetailUpdateAction) {
    switch (action.type) {
        case 'request.detail.update': 
            return updateOperations(state, action.request);
    }
    
    return state;
}

export const requestDetailDataReducer = combineReducers({
    operations: requestDetailDataMessagesReducer
});
