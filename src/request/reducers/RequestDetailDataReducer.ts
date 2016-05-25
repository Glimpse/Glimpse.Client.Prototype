import { IRequestDetailDataSelectOperationAction } from '../actions/RequestDetailDataActions';
import { IRequestDetailUpdateAction } from '../actions/RequestDetailActions';

import { ICommandAfterExecuteMessage } from '../messages/ICommandAfterExecuteMessage';
import { ICommandBeforeExecuteMessage } from '../messages/ICommandBeforeExecuteMessage';
import { IMessageEnvelope } from '../messages/IMessageEnvelope';

const processor = require('../util/request-message-processor');
 
import { Action, combineReducers } from 'redux';

import * as _ from 'lodash';

function updateSelectedIndex(state: number, action: IRequestDetailUpdateAction) {
    return action.request
        ? state
        : 0; 
}

function selectedIndexReducer(state = 0, action: Action) {
    switch (action.type) {
        case 'request.detail.data.selectOperation':
            return (<IRequestDetailDataSelectOperationAction>action).selectedIndex;            
        case 'request.detail.update':
            return updateSelectedIndex(state, <IRequestDetailUpdateAction>action);
    }
    
    return state;
}

function correlateSqlCommands(beforeMessages: IMessageEnvelope<ICommandBeforeExecuteMessage>[], afterMessages: IMessageEnvelope<ICommandAfterExecuteMessage>[]): ({ beforeMessage: IMessageEnvelope<ICommandBeforeExecuteMessage>, afterMessage: IMessageEnvelope<ICommandAfterExecuteMessage> })[] {
    // NOTE: This is a particularly naive implementation. If no after-message actually exists for a given 
    //       before-message but another later after-message does exist, that will be paired to the before-message 
    //       instead.
    
    const sortedAfterMessages = afterMessages.sort((a, b) => a.ordinal - b.ordinal);
    
    return beforeMessages.map(beforeMessage => {
        const afterMessage = _.find(sortedAfterMessages, message => message.ordinal > beforeMessage.ordinal);
        
        return {
            beforeMessage: beforeMessage,
            afterMessage: afterMessage
        }
    });
}

function getOperationForSqlCommand(commandMethod: string): string {
    switch (commandMethod) {
        case 'ExecuteReader':
            return 'Read';
        default:
            return commandMethod;
    }
}

function createSqlOperation(beforeAfterMessage: { beforeMessage: IMessageEnvelope<ICommandBeforeExecuteMessage>, afterMessage: IMessageEnvelope<ICommandAfterExecuteMessage> }) {
    return {
        ordinal: beforeAfterMessage.beforeMessage.ordinal,
        database: 'SQL',
        command: beforeAfterMessage.beforeMessage.payload.commandText,
        duration: beforeAfterMessage.afterMessage ? beforeAfterMessage.afterMessage.payload.commandDuration : undefined,
        operation: getOperationForSqlCommand(beforeAfterMessage.beforeMessage.payload.commandMethod),
        recordCount: undefined // NOTE: SQL does not track record counts.
    }
}

function createMongoDbInsertOperation(message) {
    return {
        ordinal: message.ordinal,
        database: 'MongoDB',
        command: message.payload.operation,
        duration: message.payload.duration,
        operation: 'Insert',
        recordCount: message.payload.count
    };
}

function createMongoDbReadOperation(message) {
    return {
        ordinal: message.ordinal,
        database: 'MongoDB',
        command: message.payload.operation,
        duration: message.payload.duration,
        operation: 'Read',
        recordCount: undefined // NOTE: Read does not have a 'count' property.
    };
}

function createMongoDbUpdateOperation(message) {
    return {
        ordinal: message.ordinal,
        database: 'MongoDB',
        command: message.payload.operation,
        duration: message.payload.duration,
        operation: 'Update',
        recordCount: message.payload.modifiedCount + message.payload.upsertedCount
    };
}

function createMongoDbDeleteOperation(message) {
    return {
        ordinal: message.ordinal,
        database: 'MongoDB',
        command: message.payload.operation,
        duration: message.payload.duration,
        operation: 'Delete',
        recordCount: message.payload.count
    };
}

function updateOperations(state, request) {
    if (request) {
        const options = {
            'before-execute-command': processor.getTypeMessageList,
            'after-execute-command': processor.getTypeMessageList,
            
            'data-mongodb-insert': processor.getTypeMessageList,
            'data-mongodb-read': processor.getTypeMessageList,
            'data-mongodb-update': processor.getTypeMessageList,
            'data-mongodb-delete': processor.getTypeMessageList
        };

        const processedMessages = processor.getTypeStucture(request, options);

        const allOperations = []
            .concat(correlateSqlCommands(processedMessages.beforeExecuteCommand || [], processedMessages.afterExecuteCommand || []).map(createSqlOperation))
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
    operations: requestDetailDataMessagesReducer,
    selectedIndex: selectedIndexReducer
});
