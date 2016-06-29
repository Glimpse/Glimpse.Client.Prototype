import { IRequestState } from '../stores/IRequestState';
import { IRequestDetailRequestMiddlewareState } from '../stores/IRequestDetailRequestMiddlewareState';

import { createSelector } from 'reselect';

import * as _ from 'lodash';

const getMiddlewareState = (state: IRequestState) => state.detail.request.middleware;
export const getRequest = (state: IRequestState) => state.detail.request;
export const getUrl = (state: IRequestState) => state.detail.request.url;

interface IMiddleware {
    name: string;
    packageName: string;
    headers: { [key: string]: { value: string, isCurrent: boolean } };
}

interface IFlattenedMiddleware {
    depth: number;
    middleware: IMiddleware;
}

function flattenMiddlewareRecursive(middleware: IRequestDetailRequestMiddlewareState[], middlewareArray: IFlattenedMiddleware[], currentHeaders: { [key: string]: IMiddleware }, depth: number): void {

    middleware.forEach(middlewareItem => {
        const middleware = {
            name: middlewareItem.name,
            packageName: middlewareItem.packageName,
            headers: _.mapValues(middlewareItem.headers, value => { return { value: value.value, isCurrent: false }; })
        };

        _.forEach(middleware.headers, (value, key) => {
            currentHeaders[key] = middleware;
        });

        middlewareArray.push({
            depth: depth,
            middleware: middleware
        });

        flattenMiddlewareRecursive(middlewareItem.middleware, middlewareArray, currentHeaders, depth + 1);
    });
}

function flattenMiddleware(middleware: IRequestDetailRequestMiddlewareState[]): IFlattenedMiddleware[] {
    const middlewareArray = [];
    const currentHeaders: { [key: string]: IMiddleware } = {};

    flattenMiddlewareRecursive(middleware, middlewareArray, currentHeaders, 0);

    _.forEach(currentHeaders, (value, key) => {
        value.headers[key].isCurrent = true;
    });

    return middlewareArray;
}

export const getMiddleware = createSelector(
    getMiddlewareState,
    middleware => {
        return flattenMiddleware(middleware);
    }
);

function getContentTypeFromHeaders(headers: { [key: string]: string }): string {
    let contentType = undefined;

    _.forEach(headers, (value, key) => {
        if (key.toLowerCase() === 'content-type') {
            contentType = value;

            return false;
        }
    });

    return contentType;
}

export const getRequestContentType = createSelector(
    getRequest,
    request => {
        return getContentTypeFromHeaders(request.request.headers);
    });

export const getResponseContentType = createSelector(
    getRequest,
    request => {
        return getContentTypeFromHeaders(request.response.headers);
    });
