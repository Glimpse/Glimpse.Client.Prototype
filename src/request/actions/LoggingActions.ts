import { Action } from 'redux';

import * as _ from 'lodash';

export interface IShowAllAction extends Action {
}

export interface IToggleLevelAction extends Action {
    filterIndex: number;
}

export interface IUpdateRequestDetailsAction extends Action {
    request;
}

function createAction(type: string): Action {
    return {
        type: type
    };
}

export function createShowAllAction(): Action {
    const action = createAction('request.detail.logging.filter.showAll');

    return action;
}

export function createToggleLevelAction(filterIndex: number): Action {
    return _.defaults<Action>(createAction('request.detail.logging.filter.toggleLevel'), { filterIndex: filterIndex });
}

export function createUpdateRequestDetailsAction(request): Action {
    return _.defaults<Action>(createAction('request.detail'), { request: request });
}
