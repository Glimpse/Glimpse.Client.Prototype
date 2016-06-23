import { IRequestState } from '../stores/IRequestState';
import { IRequestDetailRequestState } from '../stores/IRequestDetailRequestState';
import { IRequestDetailRequestMiddlewareState } from '../stores/IRequestDetailRequestMiddlewareState';

import { createSelector } from 'reselect';

const getRequestState = (state: IRequestState) => state.detail.request;

interface IFlattenedMiddleware {
    depth: number,
    middleware: IRequestDetailRequestMiddlewareState
}

function flattenMiddlewareRecursive(middleware: IRequestDetailRequestMiddlewareState[], middlewareArray: IFlattenedMiddleware[], depth: number): void {

    middleware.forEach(middlewareItem => {
        middlewareArray.push({
            depth: depth,
            middleware: middlewareItem
        });

        flattenMiddlewareRecursive(middlewareItem.middleware, middlewareArray, depth + 1);
    });
}

function flattenMiddleware(middleware: IRequestDetailRequestMiddlewareState[]): IFlattenedMiddleware[] {
    const middlewareArray = [];

    flattenMiddlewareRecursive(middleware, middlewareArray, 0);

    return middlewareArray;
}

export const getRequest = createSelector(
    getRequestState,
    requestState => {
        return {
            url: requestState.url,
            middleware: flattenMiddleware(requestState.middleware),
            request: requestState.request,
            response: requestState.response
        }
    }
);
