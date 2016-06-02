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

import { requestReducer } from '../reducers/RequestReducer';

import { createStore } from 'redux';

export = createStore(requestReducer);
