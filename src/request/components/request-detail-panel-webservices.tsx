'use strict';

import { IWebServicesComponentModel, IWebServicesRequest } from '../component-models/IWebServicesComponentModel';

import React = require('react');
import _ = require('lodash');

interface IWebServicesDetailsHeadersProps { 
    headers: {
        [name: string]: string;
    }
}

/**
 * React class to display service details
 */
class ServiceDetailsHeaders extends React.Component<IWebServicesDetailsHeadersProps, {}> {
    public render() {
        var headers = this.props.headers;
        
        return (
            <table className="table">
                {_.map(headers, function(value, key) {
                    return (
                        <tr>
                            <td className="truncate"><strong>{key}:</strong> {value}</td>
                        </tr>
                    );
                })}
            </table>
        );
    }
};

interface IWebServicesDetailsProps { 
    selected: IWebServicesRequest;
}

/**
 * React class to display service details
 */
class WebServicesDetails extends React.Component<IWebServicesDetailsProps, {}> {
    public render() {
        var request = this.props.selected.requestMessage;
        var response = this.props.selected.responseMessage;
            
        return (
            <div className="tab-detail-footer">
                <table className="table table-details">
                    <thead>
                        <tr>
                            <th className="table-col-title" width="50%">Request</th>
                            <th className="table-col-title" width="50%">Response</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><ServiceDetailsHeaders headers={request.headers} /></td>
                            <td><ServiceDetailsHeaders headers={response.headers} /></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
};

interface IWebServicesListingProps { 
    messages: IWebServicesRequest[];
    selected: IWebServicesRequest;
}

/**
 * React class to display service details
 */
class WebServicesListing extends React.Component<IWebServicesListingProps, {}> {
    public render() {
        var that = this;
        var messages = this.props.messages;
        var selected = this.props.selected;
        
        return (
            <div className="tab-detail-body">
                <h3>{messages.length} Requests</h3>
                <table className="table table-bordered table-striped tab-content-item table-selectable">
                    <thead>
                        <tr className="table-col-title-group">
                            <th><span className="table-col-title">Name/Path</span></th>
                            <th width="10%"><span className="table-col-title">Status</span></th>
                            <th width="10%"><span className="table-col-title">Method</span></th>
                            <th width="10%"><span className="table-col-title">Protocol</span></th>
                            <th width="10%"><span className="table-col-title">Type</span></th>
                            <th width="10%"><span className="table-col-title">Duration</span></th>
                            <th width="20%" className="table-col-featured"><span className="table-col-title">Timeline</span></th>
                        </tr>
                    </thead>
                    {messages.map(function(message, index) { 
                        var request = message.requestMessage;
                        var response = message.responseMessage;
                        var className = (index + 1) == selected.ordinal ? 'selected' : '';
                        
                        return (
                                <tr onClick={e => that.onSelectedIndex(message)} className={className}> 
                                    <td>{request.url}</td>
                                    <td>{response.statusCode}</td>
                                    <td>{request.method}</td>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>-</td>
                                    <td className="table-col-featured">-</td>
                                </tr>
                            );
                    }) }
                    <tfoot>
                        <tr className="table-body-padding table-col-title-group">
                            <th colSpan="6"></th>
                            <th className="table-col-featured"></th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        );
    } 
    
    private onSelectedIndex(message) {
        // TODO: need to publish event that selection was made
    }
}

export interface IWebServicesProps {
    request;
    componentModel: IWebServicesComponentModel;
}

/**
 * React class to for the web services messages tab
 */
export class WebServices extends React.Component<IWebServicesProps, {}> {
    public render() {
        var messages = this.props.componentModel.messages;
        var selected = this.props.componentModel.selectedMessage;
        
        if (!_.isEmpty(messages)) {
            return (
                <div className="tab-content tab-detail-holder"> 
                    <WebServicesListing messages={messages} selected={selected} />
                    <WebServicesDetails selected={selected} />
                </div>
            );
        }
        else {
            return <div className='tab-section text-minor'>Could not find any data.</div>;
        }
    } 
}
