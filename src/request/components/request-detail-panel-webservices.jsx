'use strict';

var messageProcessor = require('../util/request-message-processor');

var React = require('react');
var PanelGeneric = require('./request-detail-panel-generic');

/**
 * Return the messages to be used by the view.
 */
var getMessages = (function() {
    var getList = messageProcessor.getTypeMessageList;
    
    var options = {
        'data-http-request': getList,
        'data-http-response': getList
    };
		
    return function(request) {
		return messageProcessor.getTypeStucture(request, options); 
    }
})();

/**
 * React class to display console messages
 */
var ServiceMessages = React.createClass({
    render: function() {
        var dataHttpRequestMessages = this.props.dataHttpRequestMessages;
        var dataHttpResponseMessages = this.props.dataHttpResponseMessages;
        
        // get child items
        var requestItems = [];
        for (var i = 0; i < dataHttpRequestMessages.length; i++) {
            // TODO: replace with correlation matching once inplace
            var httpRequest = dataHttpRequestMessages[i].payload;
            var httpResponse = dataHttpResponseMessages[i].payload;
            
            requestItems.push(
                <tr>
                    <td>{httpRequest.url}</td>
                    <td>{httpResponse.statusCode}</td>
                    <td>{httpRequest.method}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td className="table-col-featured">-</td>
                </tr>);
            
        }
        
        return (
            <table className="table table-bordered table-striped tab-content-item">
                <thead>
                    <tr className="table-col-title-group">
                        <th><span className="table-col-title">Name/Path</span></th>
                        <th width="10%"><span className="table-col-title">Status</span></th>
                        <th width="10%"><span className="table-col-title">Method</span></th>
                        <th width="10%"><span className="table-col-title">Protocal</span></th>
                        <th width="10%"><span className="table-col-title">Type</span></th>
                        <th width="10%"><span className="table-col-title">Duration</span></th>
                        <th width="20%" className="table-col-featured"><span className="table-col-title">Timeline</span></th>
                    </tr>
                </thead>
                {requestItems}
                <tfoot>
                    <tr className="table-body-padding table-col-title-group">
                        <th colSpan="6"></th>
                        <th className="table-col-featured"></th>
                    </tr>
                </tfoot>
            </table>
        );
    }
});

module.exports = React.createClass({
    render: function () {
        var request = this.props.request;

        // get messages 
        var payload = getMessages(request);
        var dataHttpRequestMessages = payload.dataHttpRequest;
        var dataHttpResponseMessages = payload.dataHttpResponse;
        
        var content = null;
        if (dataHttpRequestMessages && dataHttpResponseMessages) {
            // intial processing of messages
            dataHttpRequestMessages = dataHttpRequestMessages.sort(function(a, b) { return a.ordinal - b.ordinal; });
            dataHttpResponseMessages = dataHttpResponseMessages.sort(function(a, b) { return a.ordinal - b.ordinal; });
            
            content = (
                <div className="tab-content">
                    <div className="flex flex-column flex-inherit">
                        <div>
                            <h3>{dataHttpRequestMessages.length} Requests</h3>
                            <ServiceMessages dataHttpRequestMessages={dataHttpRequestMessages} dataHttpResponseMessages={dataHttpResponseMessages} />
                        </div>
                        <div>
                            Other content.
                        </div>
                    </div>
                </div>
            );
        }
        else {
            content = <div className="tab-section text-minor">Could not find any data.</div>;
        }

        return content;
    }
});


// TODO: Need to come up with a better self registration process
(function () {
    var requestTabController = require('../request-tab');

    requestTabController.registerTab({
        key: 'tab.webservices',
        title: 'Web Services',
        component: module.exports
    });
})()
