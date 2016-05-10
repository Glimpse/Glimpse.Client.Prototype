'use strict';

import { IComponentModel } from './IComponentModel';
import { ILogMessage } from '../messages/ILogMessage';
import { ILoggingComponentState } from './ILoggingComponentState';

export interface ILogMessageModel extends ILogMessage {
    id: string;
    ordinal: number;
}

export interface ILoggingLevelModel {
    level: string;
    messageCount: number;
}

export interface ILoggingComponentModel extends IComponentModel {
    levels: ILoggingLevelModel[];
    totalMessageCount: number;

    getMessages(): ILogMessageModel[];

    isShown(level: ILoggingLevelModel): boolean;

    toggleAll(): void;
    toggleLevel(level: ILoggingLevelModel): void;
}
