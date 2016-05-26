import { createActionCreator } from './ActionCreator';

import { Action } from 'redux';

export interface IRequestDetailDataSelectOperationAction extends Action {
    selectedIndex: number;
}

export const selectOperationAction = createActionCreator<number>('request.detail.data.selectOperation');
