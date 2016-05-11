'use strict';

import { Action, createStore } from 'redux';
import * as Immutable from 'immutable';
import { combineReducers } from 'redux-immutable';

import * as _ from 'lodash';

interface LoggingShowAllAction extends Action {
}

interface LoggingToggleLevelAction extends Action {
    level: string;
}

interface UpdateRequestDetailsAction extends Action {
    request;
}

function createAction(type: string): Action {
    'use strict';

    return {
        type: type
    };
}

export function createLoggingShowAllAction(): Action {
    'use strict';

    const action = createAction('request.detail.logging.filter.showAll');

    return action;
}

export function createLoggingToggleLevelAction(level: string): Action {
    'use strict';

    return _.defaults<Action>(createAction('request.detail.logging.filter.toggleLevel'), { level: level });
}

export function createUpdateRequestDetailsAction(request): Action {
    'use strict';

    return _.defaults<Action>(createAction('request.detail'), { request: request });
}

function showAll(state: Immutable.Map<string, boolean>) {
    'use strict';

    return state.clear();
}

function toggleLevel(state: Immutable.Map<string, boolean>, level: string) {
    'use strict';

    return state.update(level, value => value === false);
}

function updateRequestLoggingLevels(
    state = Immutable.List<{ level: string, messageCount: number }>([
        { level: 'Critical', messageCount: 0 },
        { level: 'Error', messageCount: 0 },
        { level: 'Warning', messageCount: 0 },
        { level: 'Information', messageCount: 0 },
        { level: 'Verbose', messageCount: 0 },
        { level: 'Debug', messageCount: 0 }
    ]),
    messages,
    logWriteMessageIds: string[]): Immutable.List<{ level: string, messageCount: number }> {
    /*
    const allMessages = _(logWriteMessageIds)
        .map(id => messages[id])
        .filter(message => message !== undefined)
        .sortBy('ordinal')
        .map((message, index) => {
            return { message: message, index: index + 1};
        })
        .value();

    const levels = allMessages.reduce(
        (prev, value) => {
            const prevCount = prev[value.message.payload.level];

            prev[value.message.payload.level] = prevCount ? prevCount + 1 : 0;

            return prev;
        },
        { });
    */
    return state;
}

function updateRequestLogging(state = Immutable.Map<string, {}>(), messages, logWriteMessageIds: string[]): Immutable.Map<string, {}> {
    return state.update('levels', value => updateRequestLoggingLevels(<Immutable.List<{ level: string, messageCount: number }>>value, messages, logWriteMessageIds));
}

function updateRequest(state = Immutable.Map<string, {}>(), request): Immutable.Map<string, {}> {
    if (request.messages && request.types) {
        const logWriteMessageIds = request.types['log-write'];

        if (logWriteMessageIds) {
            return state.update('logging', value => updateRequestLogging(<Immutable.Map<string, {}>>value, request.messages, logWriteMessageIds));
        }
    }

    return state;
}

function updateRequestDetails(state = Immutable.Map<string, {}>(), request): Immutable.Map<string, {}> {
    if (request) {
        return state.update(request.id, value => updateRequest(<Immutable.Map<string, {}>>value, request));
    }

    return state;
}

function loggingFilterReducer(state = Immutable.Map<string, boolean>(), action: Action) {
    switch (action.type) {
    case 'request.detail.logging.filter.toggleLevel':
        return toggleLevel(state, (<LoggingToggleLevelAction>action).level);
    case 'request.detail.logging.filter.showAll':
        return showAll(state);
    default:
        return state;
    }
}

function requestsReducer(state = Immutable.Map<string, {}>(), action: Action) {
    switch (action.type) {
    case 'request.detail':
        return updateRequestDetails(state, (<UpdateRequestDetailsAction>action).request);
    default:
        return state;
    }
}

/* tslint:disable no-null-keyword */
function selectedRequestReducer(state = null, action: UpdateRequestDetailsAction): string {
    if (action.type === 'request.detail') {
        return action.request ? action.request.id : null;
    }

    return state;
}
/* tslint:disable no-null-keyword */

export default createStore(combineReducers({
    logging: combineReducers({
        filter: loggingFilterReducer
    }),
    requests: requestsReducer,
    selectedRequestId: selectedRequestReducer
}));
