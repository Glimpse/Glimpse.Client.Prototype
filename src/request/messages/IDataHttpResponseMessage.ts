/**
 * Schema for an Http data response.
 */
export interface IDataHttpResponseMessage {
    /**
     * The complete (sans fragment) requested Url, specified as an RFC 3986 Uniform Resource Identifier (Uri).
     */
    url: string; // uri
    /**
     * Key/value pairs of outgoing response headers, as strings.
     */
    headers: {
        [name: string]: string;
    };
    /**
     * The numeric status code associated with the response. (e.g. 200, 500)
     */
    statusCode: number;
    /**
     * The amount of time, in milliseconds, taken to process the request.
     */
    duration: number;
    /**
     * The time the response ended in the format specified in RFC3339 Section 5.6.
     */
    endTime: string; // date-time
}