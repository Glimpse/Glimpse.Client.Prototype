'use strict';

import { ComponentModel } from './ComponentModel';
import { IGlimpse } from '../../IGlimpse';
import { ILoggingComponentModel, ILoggingLevelModel, ILogMessageModel } from './ILoggingComponentModel';
import { ILoggingComponentState } from './ILoggingComponentState';
import { ILogMessage } from '../messages/ILogMessage';
import { IMessageEnvelope } from '../messages/IMessageEnvelope';
import { IRequestDetailStore } from '../stores/IRequestDetailStore';

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
    public constructor(private _level: string, private _messageCount: number) {
    }

    public get level(): string {
        return this._level;
    }

    public get messageCount(): number {
        return this._messageCount;
    }
}

export class LoggingComponentModel extends ComponentModel implements ILoggingComponentModel {
    private _levels: LoggingLevelModel[];
    private _messages: ILogMessageModel[];

    public constructor(private _glimpse: IGlimpse, private _requestDetailStore: IRequestDetailStore, private _messageProcessor) {
        super();
    }

    public get levels(): ILoggingLevelModel[] {
        return this._levels;
    }

    public get totalMessageCount(): number {
        return this._messages.length;
    }

    public init(request) {
        const options = {
            'log-write': this._messageProcessor.getTypeMessageList
        };

        const allMessages = this._messageProcessor.getTypeStucture(request, options);

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

            this._levels = _(levels)
                .transform(
                    (result: LoggingLevelModel[], messages, level) => {
                        result.push(new LoggingLevelModel(level, messages.length));
                    },
                    [])
                .sortBy(level => LoggingComponentModel.getOrderOfLevel(level.level))
                .value();
        }
        else {
            this._levels = [];
            this._messages = [];
        };
    }

    public getMessages(): ILogMessageModel[] {
        const state = this._requestDetailStore.getState().logging.filter;

        let filteredMessages = _(this._messages);

        if (state) {
            _.filter(this._levels, level => {
                return state[level.level] === false;
            })
            .forEach(level => {
                filteredMessages = filteredMessages.filter(message => message.level !== level.level);
            });
        }

        return filteredMessages.value();
    }

    public isShown(level: ILoggingLevelModel): boolean {
        const state = this._requestDetailStore.getState().logging.filter;

        return state === undefined || state[level.level] !== false;
    }

    public toggleAll(): void {
        const state = this._requestDetailStore.getState().logging.filter;

        let updated = false;

        _.forIn(state, (shown, level) => {
            if (state[level] === false) {
                state[level] = true;

                updated = true;
            }
        });

        if (updated) {
            this.emitUpdate(state);
        }
    }

    public toggleLevel(level: ILoggingLevelModel): void {
        const state = this._requestDetailStore.getState().logging.filter;

        if (state[level.level] === false) {
            state[level.level] = true;
        }
        else {
            state[level.level] = false;
        }

        this.emitUpdate(state);
    }

    // TODO: State should be immutable.
    private emitUpdate(state: ILoggingComponentState) {
        this._glimpse.emit('data.request.detail.logging.filter', state);
    }

    private static getOrderOfLevel(level: string): number {
        switch (level) {
            case 'Critical': return 1;
            case 'Error': return 2;
            case 'Warning': return 3;
            case 'Information': return 4;
            case 'Verbose': return 5;
            case 'Debug': return 6;
            default: return 7;
        }
    }
}
