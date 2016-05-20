import * as LoggingActions from '../actions/LoggingActions';

import { Action } from 'redux';
import * as Immutable from 'immutable';
import * as _ from 'lodash';

interface IMessageState {
    level: string,
    message: string,
    spans: ({ text: string, wasReplaced?: boolean })[]
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
        if (!_.includes(hiddenLevels, messageState.level)) {
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
                .set('filteredMessages', updatedFilteredMessagesState);
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

function indexOf(value: string, term: string, window: number) {
    for (let i = 0; i < value.length && i < window; i++) {
        if (value[i] === term) {
            return i;
        }
    }
    
    return -1;
}

function lastIndexOf(value: string, term: string, window: number) {
    const lastWindowIndex = value.length - window;
    
    for (let i = value.length - 1; i >= 0 && i >= lastWindowIndex; i--) {
        if (value[i] === term) {
            return i;
        }
    }
    
    return -1;
}

function isMessageObject(message: string): boolean {
    const OBJECT_BRACE_WINDOW = 64;

    //
    // NOTE: Our heuristic for determining whether text represents an object rather simplistic 
    //       (to minimize impact on performance). We simply look for starting and ending braces
    //       (i.e. '{' and '}') near the beginning and ending of the text, respectively, allowing 
    //       for whitespace and other text that might pre-fix/post-fix the actual object.
    //
    
    if (message) {
        const length = message.length;

        if (length > 0) {
            const startIndex = indexOf(message, '{', OBJECT_BRACE_WINDOW);
            const lastIndex = lastIndexOf(message, '}', OBJECT_BRACE_WINDOW);
            
            if (startIndex >= 0 && lastIndex >= 0 && startIndex < lastIndex) {
                return true;
            }
        }
    }
    
    return false;
}

function createSpans(message: string, replacedRegions: ({ start: number, end: number })[]): ({ text: string, wasReplaced?: boolean })[] {
    if (!message || message.length === 0) {
        return [{ text: '' }];
    }

    replacedRegions = _.sortBy(replacedRegions || [], region => region.start);

    let messageIndex = 0;
    const messageStructure = [];

    for (let i = 0; i < replacedRegions.length; i++) {
        const region = replacedRegions[i];

        if (region.start < 0 || region.start >= message.length) {
            console.warn('The region [%d,%d) exceeds the bounds of the log message (length === %d).', region.start, region.end, message.length);

            continue;
        }

        if (region.end < 0 || region.end > message.length) {
            console.warn('The region [%d,%d) exceeds the bounds of the log message (length === %d).', region.start, region.end, message.length);

            continue;
        }

        if (region.end < region.start) {
            console.warn('The region [%d,%d) is not a contiguous span in the log message (length === %d).', region.start, region.end, message.length);

            continue;
        }

        if (region.start < messageIndex) {
            console.warn('The region [%d,%d) overlaps a previous span in the log message (length === %d).', region.start, region.end, message.length);

            continue;
        }

        if (region.start === region.end) {
            // Ignore zero-length regions (to prevent creating three spans when one will do).

            continue;
        }

        if (messageIndex < region.start) {
            messageStructure.push({ text: message.substring(messageIndex, region.start) });
        }

        messageStructure.push({ text: message.substring(region.start, region.end), wasReplaced: true });

        messageIndex = region.end;
    }

    if (messageIndex < message.length) {
        messageStructure.push({ text: message.substring(messageIndex, message.length) });
    }

    return messageStructure;
}

function updateMessagesState(messagesState: Immutable.List<{}>, request) {
    if (request && request.messages && request.types) {
        const logWriteMessageIds = request.types['log-write'];

        if (logWriteMessageIds) {

            const allMessages = _(logWriteMessageIds)
                .map(id => request.messages[id])
                .filter(message => message !== undefined)
                .sortBy('ordinal')
                .map(message => {
                    return { 
                        level: message.payload.level, 
                        message: message.payload.message,
                        isObject: isMessageObject(message.payload.message),
                        spans: createSpans(message.payload.message, message.payload.replacedRegions) };
                })
                .value();

            return Immutable.List(allMessages);
        }
    }

    return messagesState.clear();
}

function updateFilterMessageCounts(filtersState: Immutable.List<Immutable.Map<string, {}>>, messagesState: Immutable.List<IMessageState>): Immutable.List<Immutable.Map<string, {}>> {
    const levels = messagesState.groupBy(messageState => messageState.level);
    
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
        .set('messages', updatedMessagesState)
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

export function loggingReducer(state = defaultState, action: Action) {
    switch (action.type) {
        case 'request.detail.logging.filter.toggleLevel':
            return toggleLevel(state, (<LoggingActions.IToggleLevelAction>action).filterIndex);
        case 'request.detail.logging.filter.showAll':
            return showAll(state);
        case 'request.detail':
            return updateRequestDetails(state, (<LoggingActions.IUpdateRequestDetailsAction>action).request);
        default:
            return state;
    }
}