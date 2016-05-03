'use strict';

import { ComponentModelComponent } from './ComponentModelComponent';
import { ILogMessage } from '../messages/ILogMessage';
import { ILoggingComponentModel, ILoggingLevelModel } from '../component-models/ILoggingComponentModel';

import React = require('react');

export interface ILoggingProps {
    request;
    viewModel: ILoggingComponentModel;
}

/**
 * React class to for the console log messages tab
 */
export class Logging extends ComponentModelComponent<ILoggingProps, {}> {
    public render() {
        const totalMessages = this.props.viewModel.totalMessageCount;

        if (totalMessages !== 0) {
            const messages = this.props.viewModel.messages;
            return (
                <div className='tab-content'>
                    <div className='tab-logs-message-count'>{totalMessages} {totalMessages === 1 ? 'Message' : 'Messages'}</div>
                    <br/>
                    <div className='flex'>
                        <button className='filter-show-all' onClick={e => this.toggleAll()}>Show all</button>
                        <div className='flex'>
                        {
                            this.props.viewModel.levels.map(
                                level => {
                                    return (
                                        <div className='filter-button-container'>
                                            <button className={level.shown ? 'filter-button-shown' : 'filter-button-not-shown'} type='button' onClick={e => this.toggleLevel(level)}>{level.level} ({level.messages.length})</button>
                                        </div>
                                    );
                                })
                        }
                        </div>
                    </div>
                    <br/>
                    <table className='table table-bordered table-striped tab-content-item'>
                        <thead>
                            <tr className='table-col-title-group'>
                                <th width='5%'><span className='table-col-title'>Ordinal</span></th>
                                <th width='10%'><span className='table-col-title'>Level</span></th>
                                <th width='40%'><span className='table-col-title'>Message</span></th>
                                <th width='10%'><span className='table-col-title'>From Start</span></th>
                                <th><span className='table-col-title'>Duration</span></th>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr className='table-body-padding table-col-title-group'><th colSpan='5'></th></tr>
                        </tfoot>
                        <tbody>
                        {
                            messages.map(message => {
                                return (
                                    <tr className='tab-logs-data-default' key={message.id}>
                                        <td>{message.ordinal}</td>
                                        <td className={Logging.getRowClass(message)}>{message.level}</td>
                                        <td>{message.message}</td>
                                        <td>-</td>
                                        <td>-</td>
                                    </tr>);
                            })
                        }
                        </tbody>
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

    private toggleLevel(level: ILoggingLevelModel) {
        this.props.viewModel.toggleLevel(level);
    }

    private toggleAll() {
        this.props.viewModel.toggleAll();
    }
}
