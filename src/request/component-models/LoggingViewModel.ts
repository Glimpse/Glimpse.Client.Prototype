'use strict';

/*tslint:disable:no-var-requires */
const messageProcessor = require('../util/request-message-processor');
/*tslint:enable:no-var-requires */

import { ILogMessage } from '../messages/ILogMessage';
import { IMessageEnvelope } from '../messages/IMessageEnvelope';

import _ = require('lodash');

export class LoggingViewModel {
    private static getList = messageProcessor.getTypeMessageList;

    private static options = {
        'log-write': LoggingViewModel.getList
    };

    private _messages: ILogMessage[];

    public get messages() {
        return this._messages;
    }

    public init(request) {
        const allMessages = messageProcessor.getTypeStucture(request, LoggingViewModel.options);

        if (allMessages) {
            this._messages = _(allMessages.logWrite)
                .sortBy<IMessageEnvelope<ILogMessage>>('ordinal')
                .map(message => message.payload)
                .value();
        }
        else {
            this._messages = [];
        };
    }
}
