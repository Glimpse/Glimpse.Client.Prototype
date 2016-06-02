import { IRequestDetailLoggingFilterState } from '../stores/IRequestDetailLoggingFilterState';
import { IRequestDetailLoggingMessageState } from '../stores/IRequestDetailLoggingMessageState';
import { IRequestDetailLoggingState } from '../stores/IRequestDetailLoggingState';

import * as LoggingActions from '../actions/LoggingActions';

import { Action } from 'redux';
import * as _ from 'lodash';

function updateFilter(filtersState: IRequestDetailLoggingFilterState[], filterIndex: number): IRequestDetailLoggingFilterState[] {
    
    const filterState = filtersState[filterIndex];
    const updatedFiltersState = filtersState.slice();
    
    updatedFiltersState[filterIndex] = {
        level: filterState.level,
        messageCount: filterState.messageCount,
        isShown: !filterState.isShown
    };
    
    return updatedFiltersState;
}

function toggleLevel(loggingState: IRequestDetailLoggingState, filterIndex: number): IRequestDetailLoggingState {
    const updatedFiltersState = updateFilter(loggingState.filters, filterIndex);

    return {
        messages: loggingState.messages,
        filters: updatedFiltersState
    };
}

function updateAllFilters(filtersState: IRequestDetailLoggingFilterState[]): IRequestDetailLoggingFilterState[] {
    return filtersState.map(filterState => {
        return {
            level: filterState.level,
            messageCount: filterState.messageCount,
            isShown: true
        };
    });
}

function showAll(loggingState: IRequestDetailLoggingState): IRequestDetailLoggingState
{
    const updatedFiltersState = updateAllFilters(loggingState.filters);

    return {
        messages: loggingState.messages,
        filters: updatedFiltersState
    };
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

function updateMessagesState(messagesState: IRequestDetailLoggingMessageState[], request): IRequestDetailLoggingMessageState[] {
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

            return allMessages;
        }
    }

    return [];
}

function updateFilterMessageCounts(filtersState: IRequestDetailLoggingFilterState[], messagesState: IRequestDetailLoggingMessageState[]): IRequestDetailLoggingFilterState[] {
    const levels = _.groupBy(messagesState, messageState => messageState.level);
    
    return filtersState.map(filterState => {
        const level = levels[filterState.level];
        
        return {
            level: filterState.level,
            messageCount: level ? level.length : 0,
            isShown: filterState.isShown
        };
    });
}

function updateRequestDetails(loggingState: IRequestDetailLoggingState, request): IRequestDetailLoggingState {
    const updatedMessagesState = updateMessagesState(loggingState.messages, request);
    const updatedFiltersState = updateFilterMessageCounts(
        loggingState.filters,
        updatedMessagesState);

    return {
        messages: updatedMessagesState,
        filters: updatedFiltersState
    };
}

const defaultState = {
    messages: [],
    filters: [
        { level: 'Critical', messageCount: 0, isShown: true },
        { level: 'Error', messageCount: 0, isShown: true },
        { level: 'Warning', messageCount: 0, isShown: true },
        { level: 'Information', messageCount: 0, isShown: true },
        { level: 'Verbose', messageCount: 0, isShown: true },
        { level: 'Debug', messageCount: 0, isShown: true }
    ]
};

export function loggingReducer(state: IRequestDetailLoggingState = defaultState, action: Action): IRequestDetailLoggingState {
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