import { createActionCreator } from './ActionCreator';

import { Action } from 'redux';

export const selectOperationAction = createActionCreator<number>('request.detail.data.select');

export const toggleFilterAction = createActionCreator<string>('request.detail.data.toggle');
