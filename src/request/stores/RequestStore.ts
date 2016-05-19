'use strict';

import { Action, createStore } from 'redux';
import * as Immutable from 'immutable';

import * as _ from 'lodash';

interface LoggingShowAllAction extends Action {
}

interface LoggingToggleLevelAction extends Action {
    filterIndex: number;
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

export function createLoggingToggleLevelAction(filterIndex: number): Action {
    return _.defaults<Action>(createAction('request.detail.logging.filter.toggleLevel'), { filterIndex: filterIndex });
}

export function createUpdateRequestDetailsAction(request): Action {
    return _.defaults<Action>(createAction('request.detail'), { request: request });
}

/*

State:

{
    messages: [
        {
            message: {
                id: '123',
                payload: {
                    level: 'Debug',
                    message: 'message'
                },
                ordinal: 123
            },
            index: 123
        }   
    ],
    filteredMessages: [
        0,
        .,
        .,
        .,
        n
    ],
    filters: [
        {
            level: 'Debug',
            isShown: true,
            messageCount: 123
        }
    ]
}

*/

function updateFilter(filterState: Immutable.Map<string, {}>) {
    return filterState.update('isShown', isShown => !isShown);
}

function updateFilters(filtersState: Immutable.List<{}>, filterIndex: index) {
    return filtersState.update(filterIndex, filterState => updateFilter(<Immutable.Map<string, {}>>filterState));
}

function updateFilteredMessages(filteredMessagesState: Immutable.List<{}>, messagesState: Immutable.List<{}>, filtersState: Immutable.List<Immutable.Map<string, {}>>) {
    var notShown = _.pick(filtersState, filterState => filterState.get('isShown') === false);
    
    let filteredMessages = messagesState;
    
    notShown.keys()
        .map((messageState, index) => {
            
        })
        .filter(messageIndex => messageIndex >= 0;
    
    return new Immutable.List(filteredMessages);
}

function toggleLevel(loggingState: Immutable.Map<string, {}>, filterIndex: number) {

    const updatedFiltersState = updateFilters(<Immutable.List<{}>>loggingState.get('filters'), filterIndex);
    const updatedFilteredMessagesState = updateFilteredMessages(
        <Immutable.List<{}>>loggingState.get('filteredMessages'),
        <Immutable.List<{}>>loggingState.get('messages'),
        <Immutable.List<{}>>updatedFiltersState);

    return loggingState.withMutations(map => {
            map
                .set('filters', updatedFiltersState)
                .set('messages', updatedFilteredMessagesState);
        });
}

function updateAllFilters(filtersState: Immutable.List<Immutable.Map<string, {}>>) {
    return filtersState.withMutations(list => {
        list.forEach(value => list.set(value.set('isShown', true));
    });
}

function showAll(loggingState: Immutable.Map<string, {}>) {
{
    const updatedFiltersState = updateAllFilters(<Immutable.List<Immutable.Map<string, {}>>>loggingState.get('filters'));
    const updatedFilteredMessagesState = updateFilteredMessages(
        <Immutable.List<{}>>loggingState.get('filteredMessages'),
        <Immutable.List<{}>>loggingState.get('messages'),
        <Immutable.List<Immutable.Map<string, {}>>>updatedFiltersState);

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

function updateFilterMessageCounts(filtersState: Immutable.OrderedMap<string, {}>, messagesState: Immutable.List<{}>) {
    // TODO: Implement me!
    return filtersState;
}

function updateRequestDetails(loggingState: Immutable.Map<string, {}>, request) {
    const updatedMessagesState = updateMessagesState(loggingState.get('messages'), request);
    const updatedFiltersState = updateFilterMessageCounts(
        <Immutable.List<{}>>loggingState.get('filters'),
        <Immutable.List<{}>>updatedMessagesState);
    const updatedFilteredMessagesState = updateFilteredMessages(
        <Immutable.List<{}>>loggingState.get('filteredMessages'),
        <Immutable.List<{}>>updatedMessagesState,
        <Immutable.List<{}>>updatedFiltersState);

    return loggingState.withMutations(map => map
        .set('messages', updatedFilteredMessagesState)
        .set('filters', updatedFiltersState)
        .set('filteredMessages', updatedFilteredMessagesState));
}

const defaultState = Immutable.Map<string, {}>({
    messages: Immutable.List(),
    filters: Immutable.List([
        Immutable.Map({ level: 'Critical', messageCount: 0, isShown: true }),
        Immutable.Map({ level: 'Error', messageCount: 0, isShown: true }),
        Immutable.Map({ level: 'Warning', messageCount: 0, isShown: true }),
        Immutable.Map({ level: 'Information', messageCount: 0, isShown: true }),
        Immutable.Map({ level: 'Verbose', messageCount: 0, isShown: true }),
        Immutable.Map({ level: 'Debug', messageCount: 0, isShown: true })
    ]),
    filteredMessages: Immutable.List()
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

export default createStore(loggingReducer);
