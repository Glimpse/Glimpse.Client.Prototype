'use strict';

/*tslint:disable:no-var-requires */
const messageProcessor = require('../util/request-message-processor');
/*tslint:enable:no-var-requires */

import { ComponentModel } from './ComponentModel';
import { ILoggingComponentModel, ILoggingLevelModel, ILogMessageModel } from './ILoggingComponentModel';
import { ILogMessage } from '../messages/ILogMessage';
import { IMessageEnvelope } from '../messages/IMessageEnvelope';

import _ = require('lodash');

class LogMessageModel implements ILogMessageModel {
    public constructor(private _message: IMessageEnvelope<ILogMessage>, private _ordinal: number) {
    }

    public get id(): string {
        return this._message.id;
    }

    public get level(): string {
        return this._message.payload.level;
    }

    public get message(): string {
        return this._message.payload.message;
    }

    public get ordinal(): number {
        return this._ordinal;
    }
}

class LoggingLevelModel implements ILoggingLevelModel {
    private _level: string;
    private _messages: ILogMessageModel[];
    private _shown: boolean = true;

    public constructor(level: string, messages: ILogMessageModel[]) {
        this._level = level;
        this._messages = messages;
    }

    public get level(): string {
        return this._level;
    }

    public get messages(): ILogMessageModel[] {
        return this._messages;
    }

    public get shown(): boolean {
        return this._shown;
    }

    public toggleShown() {
        this._shown = !this._shown;
    }
}

export class LoggingComponentModel extends ComponentModel implements ILoggingComponentModel {
    private static getList = messageProcessor.getTypeMessageList;

    private static options = {
        'log-write': LoggingComponentModel.getList
    };

    private _levels: LoggingLevelModel[];
    private _messages: ILogMessageModel[];

    public get levels(): ILoggingLevelModel[] {
        return this._levels;
    }

    public get messages() {
        let filteredMessages = _(this._messages);

        _.filter(this._levels, level => !level.shown).forEach(level => {
            filteredMessages = filteredMessages.filter(message => message.level !== level.level);
        });

        return filteredMessages.value();
    }

    public get showAll(): boolean {
        return _.all(this._levels, level => level.shown);
    }

    public get totalMessageCount(): number {
        return this._messages.length;
    }

    public init(request) {
        const allMessages = messageProcessor.getTypeStucture(request, LoggingComponentModel.options);

        if (allMessages) {
            this._messages = _(allMessages.logWrite)
                .sortBy<IMessageEnvelope<ILogMessage>>('ordinal')
                .map((message, index) => new LogMessageModel(message, index + 1))
                .value();

            const levels: { [key: string]: ILogMessageModel[] } = {};

            _.defaults(levels, _.groupBy(this._messages, message => message.level), {
                Debug: [],
                Verbose: [],
                Information: [],
                Warning: [],
                Error: [],
                Critical: []
            });

            this._levels = _.transform(
                levels,
                (result, messages, level) => {
                    result.push(new LoggingLevelModel(level, messages));
                },
                []);
        }
        else {
            this._levels = [];
            this._messages = [];
        };
    }

    public toggleAll(): void {
        const notShown = _.filter(this._levels, level => !level.shown);

        if (notShown.length > 0) {
            notShown.forEach(level => {
                level.toggleShown();
            });

            this.emitUpdate();
        }
    }

    public toggleLevel(level: ILoggingLevelModel): void {
        (<LoggingLevelModel>level).toggleShown();

        this.emitUpdate();
    }
}
