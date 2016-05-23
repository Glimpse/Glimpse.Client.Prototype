import { loggingReducer } from '../reducers/LoggingReducers';

import { createStore } from 'redux';

/*

State:

{
    messages: (I) [
        {
            message: {
                level: 'Debug',
                message: 'message'
                isObject: false
                spans: [
                    {
                        text: 'message',
                        wasReplaced?: true
                    }
                ]
            }
        }   
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

export = createStore(loggingReducer);
