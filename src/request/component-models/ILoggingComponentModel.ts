'use strict';

import { ILogMessage } from '../messages/ILogMessage';
import { IViewModel } from './IViewModel';

export interface ILoggingViewModel extends IViewModel {
    messages: ILogMessage[];
}
