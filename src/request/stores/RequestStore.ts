'use strict';

import { Action, createStore } from 'redux';
import * as Immutable from 'immutable';

import * as _ from 'lodash';

interface LoggingShowAllAction extends Action {
}

interface LoggingToggleLevelAction extends Action {
    level: string;
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

function showAll(state: Immutable.Map<string, boolean>) {
    'use strict';

    return state.clear();
}

function toggleLevel(state: Immutable.Map<string, boolean>, level: string) {
    'use strict';

    return state.update(level, value => value === false);
}

function main(state = Immutable.Map<string, boolean>(), action: Action) {
    'use strict';

    switch (action.type) {
    case 'request.detail.logging.filter.toggleLevel':
        return toggleLevel(state, (<LoggingToggleLevelAction>action).level);
    case 'request.detail.logging.filter.showAll':
        return showAll(state);
    default:
        return state;
    }
}

export default createStore(main);
