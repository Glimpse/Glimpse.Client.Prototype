'use strict';

/*tslint:disable:no-var-requires */
const messageProcessor = require('../util/request-message-processor');
/*tslint:enable:no-var-requires */

import _ = require('lodash');

import { ComponentModel } from './ComponentModel';
import { IGlimpse } from '../../IGlimpse';
import { IRequestDetailStore } from '../stores/IRequestDetailStore';
import { IMessageEnvelope } from '../messages/IMessageEnvelope';
import { IWebServicesComponentModel, IWebServicesRequest } from './IWebServicesComponentModel';
import { IDataHttpResponseMessage } from '../messages/IDataHttpResponseMessage';
import { IDataHttpRequestMessage } from '../messages/IDataHttpRequestMessage';

class WebServicesRequest implements IWebServicesRequest {
    public constructor(
            private _requestMessage: IDataHttpRequestMessage,
            private _responseMessage: IDataHttpResponseMessage, 
            private _ordinal: number
        ) { }
    
    public get requestMessage(): IDataHttpRequestMessage {
        return this._requestMessage;
    }

    public get responseMessage(): IDataHttpResponseMessage {
        return this._responseMessage;
    }

    public get ordinal(): number {
        return this._ordinal;
    }
}

export class WebServicesComponentModel extends ComponentModel implements IWebServicesComponentModel {
    private static getList = messageProcessor.getTypeMessageList; 
    private static options = {
        'data-http-request': WebServicesComponentModel.getList,
        'data-http-response': WebServicesComponentModel.getList
    };    
    
    private _requestMessages: IDataHttpRequestMessage[];
    private _responseMessages: IDataHttpResponseMessage[];
    private _messages: IWebServicesRequest[];
    private _selectedIndex: number = 0;
    
    public constructor(private _glimpse: IGlimpse, private _requestDetailStore: IRequestDetailStore, private _messageProcessor) {
        super();
    }
    
    public get requestMessages(): IDataHttpRequestMessage[] {
        return this._requestMessages;
    }

    public get responseMessages(): IDataHttpResponseMessage[] {
        return this._responseMessages;
    }

    public get messages(): IWebServicesRequest[] {
        return this._messages;
    }
    
    public get selectedMessage(): IWebServicesRequest {
        return this._messages[this._selectedIndex];
    }
    
    public init(request) {
        const messagesByType = messageProcessor.getTypeStucture(request, WebServicesComponentModel.options);
        if (messagesByType) {
            this._requestMessages = _(messagesByType.dataHttpRequest)
                                        .sortBy<IMessageEnvelope<IDataHttpRequestMessage>>('ordinal')
                                        .map((message, index) => message.payload)
                                        .value();
            this._responseMessages = _(messagesByType.dataHttpResponse)
                                        .sortBy<IMessageEnvelope<IDataHttpResponseMessage>>('ordinal')
                                        .map((message, index) => message.payload)
                                        .value();

            // TODO: this logic is naive and needs to be converted to use correlation ids 
            this._messages = _(this._requestMessages)
                                .map((message, index) => new WebServicesRequest(message, this._responseMessages[index], index + 1))
                                .value();
        }
    }
}
