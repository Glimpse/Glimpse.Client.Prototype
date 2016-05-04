'use strict';

import { ComponentModel } from './ComponentModel';
import { ILoggingComponentModel, ILoggingComponentState, ILoggingLevelModel, ILogMessageModel } from './ILoggingComponentModel';
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

export class LoggingComponentModel extends ComponentModel<ILoggingComponentState> implements ILoggingComponentModel {
    private _levels: LoggingLevelModel[];
    private _messages: ILogMessageModel[];

    public constructor(private _messageProcessor) {
        super();
    }

    public get levels(): ILoggingLevelModel[] {
        return this._levels;
    }

    public get totalMessageCount(): number {
        return this._messages.length;
    }

    public createState(oldState?: ILoggingComponentState): ILoggingComponentState {
        if (oldState) {
            return oldState;
        }

        return _.transform(this._levels, (result, level) => result[level.level] = true, {});
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

    public getMessages(state: ILoggingComponentState): ILogMessageModel[] {
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

    public toggleAll(state: ILoggingComponentState): void {
        _.forIn(state, (shown, level) => state[level] = true);

        this.emitUpdate();
    }

    public toggleLevel(state: ILoggingComponentState, level: ILoggingLevelModel): void {
        if (state[level.level] === false) {
            state[level.level] = true;
        }
        else {
            state[level.level] = false;
        }

        this.emitUpdate();
    }
}
