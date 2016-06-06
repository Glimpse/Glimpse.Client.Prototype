/**
 * Schema for an Http data request.
 */
export interface IDataHttpRequestMessage {
    /**
     * The protocol used to initiate the request.
     */
    protocol: {
        /**
         * The short protocol identifer. (e.g. HTTP, HTTPS, SPDY, WAKA)
         */
        identifier: string;
        /**
         * The protocol version. (e.g. 1.1, 2.0)
         */
        version: string;
    };
    /**
     * The complete (sans fragment) requested Url, specified as an RFC 3986 Uniform Resource Identifier (Uri).
     */
    url: string; // uri
    /**
     * The request's method. (e.g. GET, PUT, POST, SEARCH, PATCH, LOCK, MOVE)
     */
    method: string;
    /**
     * Key/value pairs of incoming request headers, as strings.
     */
    headers: {
        [name: string]: string;
    };
    /**
     * Information about the request body.
     */
    body?: {
        /**
         * The size of the request body, in bytes.
         */
        size: number;
        /**
         * Key/value pairs of incoming request body, as strings, when the Content-Type is 'application/x-www-form-urlencoded' or 'multipart/form-data'.
         */
        form?: {
            [name: string]: string;
        };
        /**
         * Information about the 'parts' of the request body, when the Content-Type is 'multipart/form-data'.
         */
        files?: {
            fileName: string;
            contentType: string;
            contentLength: number;
        }[];
    };
    /**
     * The time the request began in the format specified in RFC3339 Section 5.6.
     */
    startTime: string; // date-time
    /**
     * A flag indicating if the request was made asyncrnously from a browser.
     */
    isAjax: boolean;
    /**
     * The Ip address of the connected client in either RFC2673 (IPv4) or RFC2373 (IPv6) format.
     */
    clientIp: string /* ipv4 */  | string; // ipv6
}