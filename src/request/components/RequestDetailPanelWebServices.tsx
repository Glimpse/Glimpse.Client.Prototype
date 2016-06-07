'use strict';

const messageProcessor = require('../util/request-message-processor');

import _ = require('lodash');
import React = require('react');
import classNames = require('classnames');

var getList = messageProcessor.getTypeMessageList;

var options = {
    'data-http-request': getList,
    'data-http-response': getList
};

/**
 * Return the messages to be used by the view.
 */
function getMessages(request) {	
    return messageProcessor.getTypeStucture(request, options); 
}

interface IServiceMessagesProps {
    dataHttpRequestMessages;
    dataHttpResponseMessages;
    selectedIndex: number;
    onSelectedIndex: (index: number) => void;
}

/**
 * React class to display console messages
 */
class ServiceMessages extends React.Component<IServiceMessagesProps, {}> {
    public render() {
        var dataHttpRequestMessages = this.props.dataHttpRequestMessages;
        var dataHttpResponseMessages = this.props.dataHttpResponseMessages;
        
        // get child items
        var requestItems = [];
        for (var i = 0; i < dataHttpRequestMessages.length; i++) {
            // TODO: replace with correlation matching once inplace
            var httpRequest = dataHttpRequestMessages[i].payload;
            var httpResponse = dataHttpResponseMessages[i].payload;
            
            requestItems.push(
                <tr onClick={this.props.onSelectedIndex.bind(this, i)} className={classNames({
                        'selected': i == this.props.selectedIndex
                    })}> 
                    <td>{httpRequest.url}</td>
                    <td>{httpResponse.statusCode}</td>
                    <td>{httpRequest.method}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                </tr>);
            
        }
        
        return (
            <table className='table table-bordered table-striped tab-content-item table-selectable'>
                <thead>
                    <tr className='table-col-title-group'>
                        <th><span className='table-col-title'>Name/Path</span></th>
                        <th width='10%'><span className='table-col-title'>Status</span></th>
                        <th width='10%'><span className='table-col-title'>Method</span></th>
                        <th width='10%'><span className='table-col-title'>Protocol</span></th>
                        <th width='10%'><span className='table-col-title'>Type</span></th>
                        <th width='10%'><span className='table-col-title'>Duration</span></th>
                        <th width='20%'><span className='table-col-title'>Timeline</span></th>
                    </tr>
                </thead>
                {requestItems}
                <tfoot>
                    <tr className='table-body-padding table-col-title-group'>
                        <th colSpan={7}></th>
                    </tr>
                </tfoot>
            </table>
        );
    }
}

/**
 * React class to display service details
 */
class ServiceDetailsHeaders extends React.Component<{ headers }, {}> {
    public render() {
        var headers = this.props.headers;
        
        return (
            <table className='table'>
                {_.map(headers, function(value, key) {
                    return (
                        <tr>
                            <td className='truncate'><strong>{key}:</strong> {value}</td>
                        </tr>
                    );
                })}
            </table>
        );
    }
}

interface IServiceDetailsProps {
    selectedDataHttpRequestMessage;
    selectedDataHttpResponseMessage;
}

/**
 * React class to display service details
 */
class ServiceDetails extends React.Component<IServiceDetailsProps, {}> {
    public render() {
        var requestHeaders = this.props.selectedDataHttpRequestMessage.payload.headers;
        var responseHeaders = this.props.selectedDataHttpResponseMessage.payload.headers;
            
        return (
            <table className="table table-details">
                <thead>
                    <tr>
                        <th className="table-col-title" width="50%">Request</th>
                        <th className="table-col-title" width="50%">Response</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><ServiceDetailsHeaders headers={requestHeaders} /></td>
                        <td><ServiceDetailsHeaders headers={responseHeaders} /></td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

export class WebServices extends React.Component<{ request }, { selectedIndex: number }> {
    constructor(props?) {
        super(props);

        this.state = {
            selectedIndex: 0
        };
    }

    private _requestSelected(index) {
        this.setState({
            selectedIndex: index
        });
    }

    public render() {
        var request = this.props.request;

        // get messages 
        var payload = getMessages(request);
        var dataHttpRequestMessages = payload.dataHttpRequest;
        var dataHttpResponseMessages = payload.dataHttpResponse;
        
        var content = null;
        if (dataHttpRequestMessages && dataHttpResponseMessages) {
            var selectedDataHttpRequestMessage = dataHttpRequestMessages[this.state.selectedIndex];
            var selectedDataHttpResponseMessage = dataHttpResponseMessages[this.state.selectedIndex];
            
            // intial processing of messages
            dataHttpRequestMessages = dataHttpRequestMessages.sort(function(a, b) { return a.ordinal - b.ordinal; });
            dataHttpResponseMessages = dataHttpResponseMessages.sort(function(a, b) { return a.ordinal - b.ordinal; });
            
            content = (
                <div className="tab-content tab-detail-holder"> 
                    <div className="tab-detail-body">
                        <h3>{dataHttpRequestMessages.length} Requests</h3>
                        <ServiceMessages onSelectedIndex={index => this._requestSelected(index)} selectedIndex={this.state.selectedIndex} dataHttpRequestMessages={dataHttpRequestMessages} dataHttpResponseMessages={dataHttpResponseMessages} />
                    </div>
                    <div className="tab-detail-footer">
                        <ServiceDetails  selectedDataHttpRequestMessage={selectedDataHttpRequestMessage} selectedDataHttpResponseMessage={selectedDataHttpResponseMessage} />
                    </div> 
                </div>
            );
        }
        else {
            content = <div className="tab-section text-minor">Could not find any data.</div>;
        }

        return content;
    }
}
