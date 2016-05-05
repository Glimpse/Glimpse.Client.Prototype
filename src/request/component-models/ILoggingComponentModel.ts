'use strict';

import { IComponentModel } from './IComponentModel';
import { ILogMessage } from '../messages/ILogMessage';

export interface ILogMessageModel extends ILogMessage {
    id: string;
    ordinal: number;
}

export interface ILoggingLevelModel {
    level: string;
    messageCount: number;
}

export interface ILoggingComponentState {
    [key: string]: boolean;
}

export interface ILoggingComponentModel extends IComponentModel<ILoggingComponentState> {
    levels: ILoggingLevelModel[];
    totalMessageCount: number;

    getMessages(state: ILoggingComponentState): ILogMessageModel[];

    isShown(state: ILoggingComponentState, level: ILoggingLevelModel): boolean;

    toggleAll(state: ILoggingComponentState): void;
    toggleLevel(state: ILoggingComponentState, level: ILoggingLevelModel): void;
}
