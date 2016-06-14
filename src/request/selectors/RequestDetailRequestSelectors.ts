import { IRequestState } from '../stores/IRequestState';

import { createSelector } from 'reselect';

const getRequestState = (state: IRequestState) => state.detail.request;

function flattenMiddlewareRecursive(middleware, middlewareArray, depth: number) {

    middleware.forEach(middlewareItem => {
        middlewareArray.push(middlewareItem);

        flattenMiddlewareRecursive(middlewareItem.middleware, middlewareArray, depth + 1);
    });
}

function flattenMiddleware(middleware) {
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
