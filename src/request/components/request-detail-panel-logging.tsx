'use strict';

/*tslint:disable:no-var-requires */
const messageProcessor = require('../util/request-message-processor');
/*tslint:enable:no-var-requires */

import _ = require('lodash');
import React = require('react');

interface ILogMessage {
    level: string;
    message: string;
}

interface IMessageEnvelope {
    ordinal: number;
    payload: ILogMessage;
}

class LoggingViewModel {
    private static getList = messageProcessor.getTypeMessageList;

    private static options = {
        'log-write': LoggingViewModel.getList
    };

    private _messages: ILogMessage[];

    public get messages() {
        return this._messages;
    }

    public init(request) {
        const allMessages = messageProcessor.getTypeStucture(request, LoggingViewModel.options);

        if (allMessages) {
            this._messages = _(allMessages.logWrite as IMessageEnvelope[])
                .sortBy('ordinal')
                .map(message => message.payload)
                .value();
        }
        else {
            this._messages = [];
        };
    }
}

interface ILogMessagesProps {
    messages: ILogMessage[]
}

/**
 * React class to display console messages
 */
class LogMessages extends React.Component<ILogMessagesProps, {}> {
    public render() {
        return (
            <table className='table table-bordered table-striped tab-content-item'>
                <thead>
                    <tr className='table-col-title-group'>
                        <th width='5%'><span className='table-col-title'>#</span></th>
                        <th width='10%'><span className='table-col-title'>Level</span></th>
                        <th><span className='table-col-title'>Message</span></th>
                        <th width='10%'><span className='table-col-title'>From Start</span></th>
                        <th width='10%'><span className='table-col-title'>Duration</span></th>
                    </tr>
                </thead>
                {this.props.messages.map(function(message, index) {
                    const className = LogMessages.getRowClass(message);

                    return (
                        <tr className={className}>
                            <td>{index + 1}</td>
                            <td>{message.level}</td>
                            <td>{message.message}</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>);
                }) }
                <tfoot>
                    <tr className='table-body-padding table-col-title-group'><th colSpan='5'></th></tr>
                </tfoot>
            </table>
        );
    }

    /**
     * Return the CSS class name to use for the given message
     */
    private static getRowClass(message: ILogMessage) {
        'use strict';

        let rowClass = 'tab-logs-data-default';
        switch (message.level) {
            case 'Verbose':
            case 'Info':
                rowClass = 'tab-logs-data-default';
                break;
            case 'Critical':
            case 'Error':
                rowClass = 'tab-logs-data-error';
                break;
            case 'Warning':
                rowClass = 'tab-logs-data-warning';
                break;
            default:
                rowClass = 'tab-logs-data-default';
                break;
        }
        return rowClass;
    }
}

export interface ILoggingProps {
    request;
}

/**
 * React class to for the console log messages tab
 */
export class Logging extends React.Component<ILoggingProps, {}> {
    private viewModel = new LoggingViewModel();

    public getInitialState() {
        return { checkedState: false };
    }

    public render() {
        const request = this.props.request;

        this.viewModel.init(request);

        if (!_.isEmpty(this.viewModel.messages)) {
            return (
                <div className='tab-content'>
                    <h3>{this.viewModel.messages.length} {this.viewModel.messages.length === 1 ? 'Message' : 'Messages'}</h3>
                    <LogMessages messages={this.viewModel.messages} />
                </div>
            );
        }
        else {
            return <div className='tab-section text-minor'>Could not find any data.</div>;
        }
    }
}
