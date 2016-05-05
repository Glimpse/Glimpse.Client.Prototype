'use strict';

import { ILogMessage } from '../messages/ILogMessage';
import { ILoggingComponentModel } from '../component-models/ILoggingComponentModel';

import _ = require('lodash');
import React = require('react');

export interface ILogMessageProps {
    message: string;
    replacedRegions?: ({ start: number, end: number })[];
}

export class LogMessage extends React.Component<ILogMessageProps, {}> {
    public render() {
        const message = this.props.message || '';
        const replacedRegions = _.sortBy(this.props.replacedRegions || [], region => region.start);

        let messageIndex = 0;
        const messageStructure = [];

        for (let i = 0; i < replacedRegions.length; i++) {
            const region = replacedRegions[i];

            if (messageIndex < replacedRegions[i].start) {
                messageStructure.push(<span>{message.substring(messageIndex, region.start)}</span>);
            }

            messageStructure.push(<span className='tab-logs-data-replaced-region'>{message.substring(region.start, region.end)}</span>);

            messageIndex = region.end;
        }

        if (messageIndex < message.length) {
            messageStructure.push(<span>{message.substring(messageIndex, message.length)}</span>);
        }

        return <div>{messageStructure}</div>;
    }
}

export interface ILoggingProps {
    request;
    viewModel: ILoggingComponentModel;
}

/**
 * React class to for the console log messages tab
 */
export class Logging extends React.Component<ILoggingProps, {}> {
    public render() {
        if (!_.isEmpty(this.props.viewModel.messages)) {
            return (
                <div className='tab-content'>
                    <h3>{this.props.viewModel.messages.length} {this.props.viewModel.messages.length === 1 ? 'Message' : 'Messages'}</h3>
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
                        {this.props.viewModel.messages.map(function(message, index) {
                            const className = Logging.getRowClass(message);

                            return (
                                <tr className={className}>
                                    <td>{index + 1}</td>
                                    <td>{message.level}</td>
                                    <td><LogMessage message={message.message} replacedRegions={message.replacedRegions} /></td>
                                    <td>-</td>
                                    <td>-</td>
                                </tr>);
                        }) }
                        <tfoot>
                            <tr className='table-body-padding table-col-title-group'><th colSpan='5'></th></tr>
                        </tfoot>
                    </table>
                </div>
            );
        }
        else {
            return <div className='tab-section text-minor'>Could not find any data.</div>;
        }
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
