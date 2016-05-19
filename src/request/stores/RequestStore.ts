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
    messages: (I) [
        {
            message: {
                id: '123',
                payload: {
                    level: 'Debug',
                    message: 'message'
                },
                ordinal: 123
            }
        }   
    ],
    filteredMessages: (I) [
        0,
        .,
        .,
        .,
        n
    ],
    filters: (I) [
        (I) {
            level: 'Debug',
            isShown: true,
            messageCount: 123
        }
    ]
}

*/

interface IMessageState {
    message: {
        id: string,
        ordinal: number,
        payload: {
            level: string,
            message: string
        }
    }
}

function updateFilter(filtersState: Immutable.List<Immutable.Map<string, {}>>, filterIndex: number): Immutable.List<Immutable.Map<string, {}>> {
    return filtersState.update(filterIndex, filterState => filterState.update('isShown', isShown => !isShown));
}

function updateFilteredMessages(filteredMessagesState: Immutable.List<number>, messagesState: Immutable.List<IMessageState>, filtersState: Immutable.List<Immutable.Map<string, {}>>): Immutable.List<number> {
    const hiddenLevels = filtersState
        .filter(filterState => filterState.get('isShown') === false)
        .map(filterState => filterState.get('level'))
        .toArray();
    
    let filteredMessages: number[] = [];
    
    messagesState.forEach((messageState, index) => {
        if (!_.includes(hiddenLevels, messageState.message.payload.level)) {
            filteredMessages.push(index);
        }
    })
    
    return Immutable.List(filteredMessages);
}

function toggleLevel(loggingState: Immutable.Map<string, {}>, filterIndex: number) {

    const updatedFiltersState = updateFilter(<Immutable.List<Immutable.Map<string, {}>>>loggingState.get('filters'), filterIndex);
    const updatedFilteredMessagesState = updateFilteredMessages(
        <Immutable.List<number>>loggingState.get('filteredMessages'),
        <Immutable.List<IMessageState>>loggingState.get('messages'),
        updatedFiltersState);

    return loggingState.withMutations(map => {
            map
                .set('filters', updatedFiltersState)
                .set('messages', updatedFilteredMessagesState);
        });
}

function updateAllFilters(filtersState: Immutable.List<Immutable.Map<string, {}>>): Immutable.List<Immutable.Map<string, {}>> {
    return filtersState.withMutations(list => {
        list.forEach((value, index) => list.set(index, value.set('isShown', true)));
    });
}

function showAll(loggingState: Immutable.Map<string, {}>)
{
    const updatedFiltersState = updateAllFilters(<Immutable.List<Immutable.Map<string, {}>>>loggingState.get('filters'));
    const updatedFilteredMessagesState = updateFilteredMessages(
        <Immutable.List<number>>loggingState.get('filteredMessages'),
        <Immutable.List<IMessageState>>loggingState.get('messages'),
        updatedFiltersState);

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
                    return { message: message };
                })
                .value();

            return Immutable.List(allMessages);
        }
    }

    return messagesState.clear();
}

function updateFilterMessageCounts(filtersState: Immutable.List<Immutable.Map<string, {}>>, messagesState: Immutable.List<IMessageState>): Immutable.List<Immutable.Map<string, {}>> {
    const levels = messagesState.groupBy(messageState => messageState.message.payload.level);
    
    return filtersState.withMutations(list => {
        list.forEach((filterState, index) => {
            const level = levels.get(<string>filterState.get('level'));
            
            list.set(index, filterState.set('messageCount', level ? level.count() : 0));
        });
    })
}

function updateRequestDetails(loggingState: Immutable.Map<string, {}>, request) {
    const updatedMessagesState = updateMessagesState(<Immutable.List<{}>>loggingState.get('messages'), request);
    const updatedFiltersState = updateFilterMessageCounts(
        <Immutable.List<Immutable.Map<string, {}>>>loggingState.get('filters'),
        <Immutable.List<IMessageState>>updatedMessagesState);
    const updatedFilteredMessagesState = updateFilteredMessages(
        <Immutable.List<number>>loggingState.get('filteredMessages'),
        <Immutable.List<IMessageState>>updatedMessagesState,
        updatedFiltersState);

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
            return toggleLevel(state, (<LoggingToggleLevelAction>action).filterIndex);
        case 'request.detail.logging.filter.showAll':
            return showAll(state);
        case 'request.detail':
            return updateRequestDetails(state, (<UpdateRequestDetailsAction>action).request);
        default:
            return state;
    }
}

export default createStore(loggingReducer);
