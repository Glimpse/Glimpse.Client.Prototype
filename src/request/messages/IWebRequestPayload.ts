export const WebRequestType = 'web-request';

export interface IWebRequestPayload {
    url: string;
    method: string;
    headers: { [key: string]: string };
    startTime: string;
    path: string;
    query: string;
}
