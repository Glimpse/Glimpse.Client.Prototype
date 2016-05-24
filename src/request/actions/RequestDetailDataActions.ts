import { Action } from 'redux';

export interface IRequestDetailDataSelectOperationAction extends Action {
    selectedIndex: number;
}

export function createSelectOperationAction(selectedIndex: number): IRequestDetailDataSelectOperationAction {
    return {
        type: 'request.detail.data.selectOperation',
        selectedIndex: selectedIndex
    }
}