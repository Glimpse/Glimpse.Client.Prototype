import { IRequestState } from '../stores/IRequestState';
import { IRequestDetailRequestState } from '../stores/IRequestDetailRequestState';
import { IRequestDetailRequestMiddlewareState } from '../stores/IRequestDetailRequestMiddlewareState';

import { createSelector } from 'reselect';

const getMiddlewareState = (state: IRequestState) => state.detail.request.middleware;

export const getUrl = (state: IRequestState) => state.detail.request.url;
export const getRequest = (state: IRequestState) => state.detail.request.request;
export const getResponse = (state: IRequestState) => state.detail.request.response;

interface IFlattenedMiddleware {
    depth: number,
    middleware: { name: string, packageName: string, headers: { [key: string]: string } }
}

function flattenMiddlewareRecursive(middleware: IRequestDetailRequestMiddlewareState[], middlewareArray: IFlattenedMiddleware[], depth: number): void {

    middleware.forEach(middlewareItem => {
        middlewareArray.push({
            depth: depth,
            middleware: {
                name: middlewareItem.name,
                packageName: middlewareItem.packageName,
                headers: middlewareItem.headers
            }
        });

        flattenMiddlewareRecursive(middlewareItem.middleware, middlewareArray, depth + 1);
    });
}

function flattenMiddleware(middleware: IRequestDetailRequestMiddlewareState[]): IFlattenedMiddleware[] {
    const middlewareArray = [];

    flattenMiddlewareRecursive(middleware, middlewareArray, 0);

    return middlewareArray;
}

export const getMiddleware = createSelector(
    getMiddlewareState,
    middleware => {
        return flattenMiddleware(middleware);
    }
);
