import { Action } from 'redux';

export interface IRequestDetailUpdateAction extends Action {
    request;
}

export function createRequestDetailUpdateAction(request): IRequestDetailUpdateAction {
    return {
        type: 'request.detail.update',
        request: request
    }
}