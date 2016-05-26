import { createActionCreator } from './ActionCreator';

import { Action } from 'redux';

export interface IRequestDetailUpdateAction extends Action {
    request;
}

export const requestDetailUpdateAction = 
    createActionCreator(
        'request.detail.update', 
        request => {
            return request;
        });
