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

    toggleShown(): void;
}

export interface ILoggingComponentModel extends IComponentModel {
    levels: ILoggingLevelModel[];
    messages: ILogMessageModel[];
    showAll: boolean;
    totalMessageCount: number;

    toggleAll(): void;
}
