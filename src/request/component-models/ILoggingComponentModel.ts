'use strict';

import { IComponentModel } from './IComponentModel';
import { ILogMessage } from '../messages/ILogMessage';

export interface ILogMessageModel extends ILogMessage {
    id: string;
}

export interface ILoggingLevelModel {
    level: string;
    messages: ILogMessageModel[];
    shown: boolean;

    toggleShown(): void;
}

export interface ILoggingComponentModel extends IComponentModel {
    isEmpty: boolean;
    levels: ILoggingLevelModel[];
    messages: ILogMessageModel[];
    showAll: boolean;

    toggleAll(): void;
}
