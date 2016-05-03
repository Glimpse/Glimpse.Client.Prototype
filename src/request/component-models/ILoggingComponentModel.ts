'use strict';

import { IComponentModel } from './IComponentModel';
import { ILogMessage } from '../messages/ILogMessage';

export interface ILogModel extends ILogMessage {
    id: string;
}

export interface ILoggingLevelModel {
    level: string;
    messages: ILogModel[];
    shown: boolean;
}

export interface ILoggingComponentModel extends IComponentModel {
    isEmpty: boolean;
    levels: ILoggingLevelModel[];
    messages: ILogModel[];
    showAll: boolean;

    toggleAll(): void;
    toggleLevel(level: ILoggingLevelModel): void;
}
