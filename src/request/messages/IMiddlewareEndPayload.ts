export const MiddlewareEndType = 'middleware-end';

export interface IMiddlewareEndPayload {
    correlationId: string;
    name: string;
    displayName: string;
    packageName: string;
    endTime: string;
    duration: number;
    headers: { [key: string]: string };
    result: string;
}
