import { IRequestDetailWebServicesRequestState } from '../stores/IRequestDetailWebServicesRequestState';

import _ = require('lodash');
import React = require('react');
import classNames = require('classnames');

interface IServiceMessagesProps {
    requests: IRequestDetailWebServicesRequestState[];
    selectedRequestId: string;
    onSelectRequest: (requestId: string) => void;
}

/**
 * React class to display console messages
 */
class ServiceMessages extends React.Component<IServiceMessagesProps, {}> {
    public render() {       
        // get child items
        var requestItems = [];
        for (var i = 0; i < this.props.requests.length; i++) {
            const request = this.props.requests[i];
            
            requestItems.push(
                <tr key={request.id} onClick={e => this.props.onSelectRequest(request.id)} className={classNames({
                        'selected': request.id === this.props.selectedRequestId
                    })}> 
                    <td>{request.url}</td>
                    <td>{request.statusCode}</td>
                    <td>{request.method}</td>
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
    requestHeaders: { [key: string]: string };
    responseHeaders: { [key: string]: string };
}

/**
 * React class to display service details
 */
class ServiceDetails extends React.Component<IServiceDetailsProps, {}> {
    public render() {
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
                        <td><ServiceDetailsHeaders headers={this.props.requestHeaders} /></td>
                        <td><ServiceDetailsHeaders headers={this.props.responseHeaders} /></td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

export interface IWebServicesProps {
    requests: IRequestDetailWebServicesRequestState[];
    selectedRequest: IRequestDetailWebServicesRequestState;
}

export interface IWebServicesDispatchProps {
    onSelectRequest: (requestId: string) => void;
}

interface IWebServicesCombinedProps extends IWebServicesProps, IWebServicesDispatchProps{
}

export class WebServices extends React.Component<IWebServicesCombinedProps, {}> {
    public render() {
        if (this.props.requests.length > 0) {
            const selectedRequestId = this.props.selectedRequest ? this.props.selectedRequest.id : '';
            const requestHeaders: { [key:string]: string } = this.props.selectedRequest ? this.props.selectedRequest.requestHeaders : {};
            const responseHeaders: { [key:string]: string } = this.props.selectedRequest ? this.props.selectedRequest.responseHeaders : {};

            return (
                <div className="tab-content tab-detail-holder"> 
                    <div className="tab-detail-body">
                        <h3>{this.props.requests.length} Requests</h3>
                        <ServiceMessages onSelectRequest={requestId => this.props.onSelectRequest(requestId)} selectedRequestId={selectedRequestId} requests={this.props.requests} />
                    </div>
                    <div className="tab-detail-footer">
                        <ServiceDetails requestHeaders={requestHeaders} responseHeaders={responseHeaders} />
                    </div> 
                </div>
            );
        }
        else {
            return <div className="tab-section text-minor">Could not find any data.</div>;
        }
    }
}
