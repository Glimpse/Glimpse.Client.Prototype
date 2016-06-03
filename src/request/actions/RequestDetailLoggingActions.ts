import { createActionCreator } from './ActionCreator';

import { Action } from 'redux';

// TODO: Use simple action creator.
export const showAllAction = createActionCreator<string>('request.detail.logging.all');

export const toggleLevelAction = createActionCreator<number>('request.detail.logging.toggle');
