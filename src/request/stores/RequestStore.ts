'use strict';

import { Action, createStore } from 'redux';
import * as Immutable from 'immutable';
//import { combineReducers } from 'redux-immutable';

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
    return {
        type: type
    };
}

export function createLoggingShowAllAction(): Action {
    const action = createAction('request.detail.logging.filter.showAll');

    return action;
}

export function createLoggingToggleLevelAction(level: string): Action {
    return _.defaults<Action>(createAction('request.detail.logging.filter.toggleLevel'), { level: level });
}

export function createUpdateRequestDetailsAction(request): Action {
    return _.defaults<Action>(createAction('request.detail'), { request: request });
}

function showAll(state: Immutable.Map<string, boolean>) {
    return state.clear();
}

function updateFilter(filterState: Immutable.Map<string, {}>) {
    return filterState.update('isShown', isShown => !isShown);
}

function updateFilters(filtersState: Immutable.OrderedMap<string, {}>, level: string) {
    return filtersState.update(level, filterState => updateFilter(<Immutable.Map<string, {}>>filterState));
}

function updateFilteredMessages(filteredMessagesState: Immutable.List<{}>, messagesState: Immutable.List<{}>, filtersState: Immutable.OrderedMap<string, {}>) {
    // TODO: Implement me!
    return filteredMessagesState;
}

function toggleLevel(loggingState: Immutable.Map<string, {}>, level: string) {

    const updatedFiltersState = updateFilters(<Immutable.OrderedMap<string, {}>>loggingState.get('filters'), level);
    const updatedFilteredMessagesState = updateFilteredMessages(
        <Immutable.List<{}>>loggingState.get('filteredMessages'),
        <Immutable.List<{}>>loggingState.get('messages'),
        <Immutable.OrderedMap<string, {}>>updatedFiltersState);

    return loggingState.withMutations(map => {
            map
                .set('filters', updatedFiltersState)
                .set('messages', updatedFilteredMessagesState);
        });
}

function updateAllFilters(filtersState: Immutable.OrderedMap<string, {}>) {
    return filtersState.withMutations(map => {
        map.forEach(value => map.set('isShown', true));
    });
}

function showAll(loggingState: Immutable.Map<string, {}>) {
{
    const updatedFiltersState = updateAllFilters(<Immutable.OrderedMap<string, {}>>loggingState.get('filters'));
    const updatedFilteredMessagesState = updateFilteredMessages(
        <Immutable.List<{}>>loggingState.get('filteredMessages'),
        <Immutable.List<{}>>loggingState.get('messages'),
        <Immutable.OrderedMap<string, {}>>updatedFiltersState);

    return loggingState.withMutations(map => map
        .set('filters', updatedFiltersState)
        .set('filteredMessages', updatedFilteredMessagesState));
}

function updateMessagesState(messagesState: Immutable.List<{}>, request) {
    if (request && request.messages && request.types) {
        const logWriteMessageIds = request.types['log-write'];

        if (logWriteMessageIds) {

            const allMessages = _(logWriteMessageIds)
                .map(id => request.messages[id])
                .filter(message => message !== undefined)
                .sortBy('ordinal')
                .map((message, index) => {
                    return { message: message, index: index + 1};
                })
                .value();

            return Immutable.List(allMessages);
        }
    }

    return messagesState.clear();
}

function updateRequestDetails(loggingState: Immutable.Map<string, {}>, request) {
    // TODO: Update messages.
    // TODO: Update filters (i.e. message count).
    // TODO: Updated filtered messages.

    const updatedMessagesState = updateMessagesState(loggingState.get('messages'), request);
    const updatedFiltersState = updateFilterMessageCounts(
        <Immutable.OrderedMap<string, {}>>loggingState.get('filters'),
        <Immutable.List<{}>>updatedMessagesState);
    const updatedFilteredMessagesState = updateFilteredMessages(
        <Immutable.List<{}>>loggingState.get('filteredMessages'),
        <Immutable.List<{}>>updatedMessagesState,
        <Immutable.OrderedMap<string, {}>>updatedFiltersState);

    return loggingState.withMutations(map => map
        .set('messages', updatedFilteredMessagesState)
        .set('filters', updatedFiltersState)
        .set('filteredMessages', updatedFilteredMessagesState));

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

const defaultState = Immutable.Map<string, {}>({
    filters: Immutable.OrderedMap<string, {}>({
        'Critical': Immutable.Map({ messageCount: 0, isShown: true }),
        'Error': Immutable.Map({ messageCount: 0, isShown: true }),
        'Warning': Immutable.Map({ messageCount: 0, isShown: true }),
        'Information': Immutable.Map({ messageCount: 0, isShown: true }),
        'Verbose': Immutable.Map({ messageCount: 0, isShown: true }),
        'Debug': Immutable.Map({ messageCount: 0, isShown: true })
    })
});

function loggingReducer(state = defaultState, action: Action) {
    switch (action.type) {
        case 'request.detail.logging.filter.toggleLevel':
            return toggleLevel(state, (<LoggingToggleLevelAction>action).level);
        case 'request.detail.logging.filter.showAll':
            return showAll(state);
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

export default createStore(loggingReducer);
