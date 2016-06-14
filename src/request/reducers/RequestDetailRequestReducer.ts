import { IRequestDetailRequestMiddlewareState } from '../stores/IRequestDetailRequestMiddlewareState';
import { IRequestDetailRequestState } from '../stores/IRequestDetailRequestState';
import { IMessage, IMessageEnvelope } from '../messages/IMessageEnvelope';
import { IMiddlewareEndPayload, MiddlewareEndType } from '../messages/IMiddlewareEndPayload';
import { IMiddlewareStartPayload, MiddlewareStartType } from '../messages/IMiddlewareStartPayload';
import { IWebRequestPayload, WebRequestType } from '../messages/IWebRequestPayload';
import { IWebResponsePayload, WebResponseType } from '../messages/IWebResponsePayload';
import { requestDetailUpdateAction } from '../actions/RequestDetailActions';

import { Action } from 'redux';
import * as _ from 'lodash';

const defaultState: IRequestDetailRequestState = {
    url: '',
    middleware: [],
    request: {
        body: '',
        headers: {}
    },
    response: {
        body: '',
        headers: {}
    }
};

// TODO: Consolidate this function into a utility function across reducers.
function getMessages(request, messageType: string): IMessage[] {
    const messageIds = request.types[messageType];
    
    if (messageIds) {
        return messageIds.map(messageId => request.messages[messageId]);
    }
    
    return [];
}

function getMessageWithPayload<T>(request, messageType: string): IMessageEnvelope<T> {
    const messageIds = request.types[messageType];
    
    if (messageIds && messageIds.length > 0) {
        return request.messages[messageIds[0]];
    }
    
    return undefined;
}

interface ICorrelatedMiddlewareMessages {
    startMessage: IMessageEnvelope<IMiddlewareStartPayload>;
    endMessage: IMessageEnvelope<IMiddlewareEndPayload>;
    middleware: ICorrelatedMiddlewareMessages[];
}

function correlateMiddlewareMessages(startMessages: IMessageEnvelope<IMiddlewareStartPayload>[], endMessages: IMessageEnvelope<IMiddlewareEndPayload>[]): ICorrelatedMiddlewareMessages[] {
    const endMessagesByCorrelationId = _.keyBy(endMessages, endMessage => endMessage.payload.correlationId);    
    const sortedStartMessages = startMessages.sort((a, b) => a.ordinal - b.ordinal);
    
    const messageStack = [
        {
            startMessage: undefined,
            endMessage: undefined,
            middleware: []
        }
    ];

    sortedStartMessages.forEach(startMessage => {
        const topOfStack = messageStack[messageStack.length - 1];

        while (messageStack[messageStack.length - 1].endMessage && startMessage.ordinal > messageStack[messageStack.length - 1].endMessage.ordinal) {
            messageStack.pop();
        }

        const middleware = {
            startMessage: startMessage,
            endMessage: endMessagesByCorrelationId[startMessage.payload.correlationId],
            middleware: []
        };

        messageStack[messageStack.length - 1].middleware.push(middleware);
        messageStack.push(middleware);
    });

    return messageStack[0].middleware;
}

function toMap<T, TResult>(values: T[], keySelector: (value: T) => string, valueSelector: (value: T) => TResult): { [key: string]: TResult } {

    return _.reduce(
        values, 
        (result: { [key: string]: TResult }, value: T) => {
            result[keySelector(value)] = valueSelector(value);

            return result;
        }, 
        <{ [key: string]: TResult }>{});
}

function createMiddlewareState(messages: ICorrelatedMiddlewareMessages): IRequestDetailRequestMiddlewareState {
    // NOTE: We ignore Express Router header modifications as they're likely actually modifications made by route middleware, not the Router itself.

    return {
        headers: messages.endMessage && messages.startMessage.payload.name !== 'router' ? toMap(messages.endMessage.payload.headers, header => header.name, header => header.value) : {},
        middleware: messages.middleware.map(middlewareMessages => createMiddlewareState(middlewareMessages)),
        name: messages.startMessage.payload.displayName || messages.startMessage.payload.name,
        packageName: messages.startMessage.payload.packageName
    };
}

function updateRequestState(state: IRequestDetailRequestState, request): IRequestDetailRequestState {
    if (request) {
        const requestMessage = getMessageWithPayload<IWebRequestPayload>(request, WebRequestType);
        const responseMessage = getMessageWithPayload<IWebResponsePayload>(request, WebResponseType);

        return {
            url: requestMessage ? requestMessage.payload.url : undefined,
            middleware: correlateMiddlewareMessages(getMessages(request, MiddlewareStartType), getMessages(request, MiddlewareEndType)).map(messages => createMiddlewareState(messages)),
            request: {
                body: requestMessage && requestMessage.payload.body && requestMessage.payload.body.content ? requestMessage.payload.body.content : '',
                headers: requestMessage ? requestMessage.payload.headers : undefined
            },
            response: {
                body: responseMessage && responseMessage.payload.body && responseMessage.payload.body.content ? responseMessage.payload.body.content : '',
                headers: responseMessage ? responseMessage.payload.headers : undefined
            }
        };
    }

    return defaultState;
}

export function requestReducer(state: IRequestDetailRequestState = defaultState, action: Action) {
    switch (action.type) {
        case requestDetailUpdateAction.type:
            return updateRequestState(state, requestDetailUpdateAction.unwrap(action));
    }

    return state;
}
