import { IRequestDetailDataOperationState } from '../stores/IRequestDetailDataOperationState';
import { IRequestDetailDataSelectOperationAction } from '../actions/RequestDetailDataActions';
import { IRequestDetailUpdateAction } from '../actions/RequestDetailActions';

import { ICommandAfterExecutePayload } from '../messages/ICommandAfterExecutePayload';
import { ICommandBeforeExecutePayload } from '../messages/ICommandBeforeExecutePayload';
import { IDataMongoDbDeletePayload } from '../messages/IDataMongoDbDeletePayload';
import { IDataMongoDbInsertPayload } from '../messages/IDataMongoDbInsertPayload';
import { IDataMongoDbReadPayload } from '../messages/IDataMongoDbReadPayload';
import { IDataMongoDbUpdatePayload } from '../messages/IDataMongoDbUpdatePayload';
import { IMessageEnvelope } from '../messages/IMessageEnvelope';

const processor = require('../util/request-message-processor');
 
import { Action, combineReducers } from 'redux';

import * as _ from 'lodash';

interface ISortableOperation extends IRequestDetailDataOperationState {
    ordinal: number;
}

function updateSelectedIndex(state: number, action: IRequestDetailUpdateAction) {
    return action.request
        ? state
        : 0; 
}

function selectedIndexReducer(state: number = 0, action: Action) {
    switch (action.type) {
        case 'request.detail.data.selectOperation':
            return (<IRequestDetailDataSelectOperationAction>action).selectedIndex;            
        case 'request.detail.update':
            return updateSelectedIndex(state, <IRequestDetailUpdateAction>action);
    }
    
    return state;
}

function correlateSqlCommands(beforeMessages: IMessageEnvelope<ICommandBeforeExecutePayload>[], afterMessages: IMessageEnvelope<ICommandAfterExecutePayload>[]): ({ beforeMessage: IMessageEnvelope<ICommandBeforeExecutePayload>, afterMessage: IMessageEnvelope<ICommandAfterExecutePayload> })[] {
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

function createSqlOperation(beforeAfterMessage: { beforeMessage: IMessageEnvelope<ICommandBeforeExecutePayload>, afterMessage: IMessageEnvelope<ICommandAfterExecutePayload> }): ISortableOperation {
    return {
        ordinal: beforeAfterMessage.beforeMessage.ordinal,
        database: 'SQL',
        command: beforeAfterMessage.beforeMessage.payload.commandText,
        duration: beforeAfterMessage.afterMessage ? beforeAfterMessage.afterMessage.payload.commandDuration : undefined,
        operation: getOperationForSqlCommand(beforeAfterMessage.beforeMessage.payload.commandMethod),
        recordCount: undefined // NOTE: SQL does not track record counts.
    }
}

function createMongoDbInsertOperation(message: IMessageEnvelope<IDataMongoDbInsertPayload>): ISortableOperation {
    return {
        ordinal: message.ordinal,
        database: 'MongoDB',
        command: message.payload.operation,
        duration: message.payload.duration,
        operation: 'Insert',
        recordCount: message.payload.count
    };
}

function createMongoDbReadOperation(message: IMessageEnvelope<IDataMongoDbReadPayload>): ISortableOperation {
    return {
        ordinal: message.ordinal,
        database: 'MongoDB',
        command: message.payload.operation,
        duration: message.payload.duration,
        operation: 'Read',
        recordCount: undefined // NOTE: Read does not have a 'count' property.
    };
}

function createMongoDbUpdateOperation(message: IMessageEnvelope<IDataMongoDbUpdatePayload>): ISortableOperation {
    return {
        ordinal: message.ordinal,
        database: 'MongoDB',
        command: message.payload.operation,
        duration: message.payload.duration,
        operation: 'Update',
        recordCount: message.payload.modifiedCount + message.payload.upsertedCount
    };
}

function createMongoDbDeleteOperation(message: IMessageEnvelope<IDataMongoDbDeletePayload>): ISortableOperation {
    return {
        ordinal: message.ordinal,
        database: 'MongoDB',
        command: message.payload.operation,
        duration: message.payload.duration,
        operation: 'Delete',
        recordCount: message.payload.count
    };
}

function updateOperations(state: IRequestDetailDataOperationState[], request): IRequestDetailDataOperationState[] {
    if (request) {
        const options = {
            // SQL Messages
            'before-execute-command': processor.getTypeMessageList,
            'after-execute-command': processor.getTypeMessageList,
            
            // MongoDB Messages
            'data-mongodb-insert': processor.getTypeMessageList,
            'data-mongodb-read': processor.getTypeMessageList,
            'data-mongodb-update': processor.getTypeMessageList,
            'data-mongodb-delete': processor.getTypeMessageList
        };

        const processedMessages = processor.getTypeStucture(request, options);

        const allOperations = <ISortableOperation[]>[]
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

function operationsReducer(state: IRequestDetailDataOperationState[] = [], action: IRequestDetailUpdateAction): IRequestDetailDataOperationState[] {
    switch (action.type) {
        case 'request.detail.update': 
            return updateOperations(state, action.request);
    }
    
    return state;
}

export const requestDetailDataReducer = combineReducers({
    operations: operationsReducer,
    selectedIndex: selectedIndexReducer
});
