'use strict';

import { IComponentModel } from './IComponentModel';
import { IDataHttpResponseMessage } from '../messages/IDataHttpResponseMessage';
import { IDataHttpRequestMessage } from '../messages/IDataHttpRequestMessage';

export interface IWebServicesRequest {
    /**
     * Request messages
     */
    requestMessage: IDataHttpRequestMessage;
    
    /**
     * Response messages
     */
    responseMessage: IDataHttpResponseMessage;
    
    /**
     * Ordingal of where this request/response sits 
     */
    ordinal: number;
}

export interface IWebServicesComponentModel extends IComponentModel {
    /**
     * All the request messages
     */
    requestMessages: IDataHttpRequestMessage[];
    
    /**
     * All the response messages
     */
    responseMessages: IDataHttpResponseMessage[];
    
    /**
     * All request/response message grouped by requst
     */
    messages: IWebServicesRequest[];
    
    /**
     * The selected recrod for target request/response
     */
    selectedMessage: IWebServicesRequest;
}
