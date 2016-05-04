'use strict';

import { IComponentModel } from './IComponentModel';
import { ILogMessage } from '../messages/ILogMessage';

export interface ILogMessageModel extends ILogMessage {
    id: string;
    ordinal: number;
}

export interface ILoggingLevelModel {
    level: string;
    messages: ILogMessageModel[];
    shown: boolean;
}

export interface ILoggingComponentState {
    [key: string]: boolean;
}

export interface ILoggingComponentModel extends IComponentModel<ILoggingComponentState> {
    levels: ILoggingLevelModel[];
    totalMessageCount: number;

    getMessages(state: ILoggingComponentState): ILogMessageModel[];

    toggleAll(state: ILoggingComponentState): void;
    toggleLevel(state: ILoggingComponentState, level: ILoggingLevelModel): void;
}
