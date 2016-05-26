import { Action } from 'redux';

interface IActionCreatorAction<T> extends Action {
    payload: T;
}

interface IActionCreator<T> {
    (): IActionCreatorAction<T>;
    
    type: string;
    unwrap(action: Action): T;
}

export function createActionCreator<T>(type: string, payloadCreator: (...args) => T): IActionCreator<T> {
    const actionCreator = (...args) => {
        return {
            type: type,
            payload: payloadCreator(...args)
        }
    };
    
    const typedActionCreator = <IActionCreator<T>>actionCreator;
    
    typedActionCreator.type = type;
    typedActionCreator.unwrap = (action: Action) => {
        return (<IActionCreatorAction<T>>action).payload;
    };
    
    return typedActionCreator;
}
