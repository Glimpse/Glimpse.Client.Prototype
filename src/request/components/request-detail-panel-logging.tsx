'use strict';

import { FontAwesomeIcon } from '../../shell/components/FontAwesomeIcon';
import { ILogMessage } from '../messages/ILogMessage';
import { ILoggingComponentModel, ILoggingLevelModel, ILogMessageModel } from '../component-models/ILoggingComponentModel';

import _ = require('lodash');
import React = require('react');
import Highlight = require('react-highlight');

interface ILogMessageProps {
    message: ILogMessageModel;
}

interface ILogMessageState {
    isExpanded: boolean;
}

class LogMessage extends React.Component<ILogMessageProps, ILogMessageState> {
    constructor(props?) {
        super(props);

        this.state = {
            isExpanded: false
        };
    }

    public render() {
        return (
            <div className='tab-logs-table-message'>
                <div className={this.getIconClass()} onClick={e => this.onToggleExpansion()}><FontAwesomeIcon path={this.getIconPath()} /></div>
                {
                    (this.state.isExpanded && this.props.message.isObject)
                        ? <div className='tab-logs-table-message-object'><Highlight language='javascript'>{this.props.message.message}</Highlight></div>
                        : <div className={this.getMessageClass()}>{this.props.message.spans.map(span => <span className={span.wasReplaced ? 'tab-logs-table-message-replaced-region' : ''}>{span.text}</span>)}</div>
                }
            </div>);
    }
    
    private onToggleExpansion(): void {
        this.setState({
            isExpanded: !this.state.isExpanded
        });
    }

    private getIconClass() {
        if (this.state.isExpanded) {
            return 'tab-logs-table-message-icon-expandable';
        }
        else if (this.props.message.isObject) {
            return 'tab-logs-table-message-icon-expandable';
        }
        else {
            return 'tab-logs-table-message-icon';
        }
    }

    private getMessageClass() {
        return this.state.isExpanded
            ? 'tab-logs-table-message-multiline'
            : '';
    }

    private getIconPath() {
        return this.state.isExpanded
            ? FontAwesomeIcon.paths.CaretDown
            : FontAwesomeIcon.paths.CaretRight;
    }
}

export interface ILoggingProps {
    componentModel: ILoggingComponentModel;
}

/**
 * React class to for the console log messages tab
 */
export class Logging extends React.Component<ILoggingProps, {}> {
    public render() {
        const totalMessages = this.props.componentModel.totalMessageCount;

        if (totalMessages !== 0) {
            const messages = this.props.componentModel.getMessages();
            return (
                <div className='tab-content tab-logs'>
                    <div className='tab-logs-message-count'>{totalMessages} {totalMessages === 1 ? 'Message' : 'Messages'}</div>
                    <br/>
                    <div className='flex filter-bar'>
                        <button className='filter-show-all' onClick={e => this.toggleAll()}>Show All</button>
                        <div className='flex'>
                        {
                            this.props.componentModel.levels.map(
                                level => {
                                    return <button className={this.props.componentModel.isShown(level) ? 'filter-button-shown' : 'filter-button-not-shown'} type='button' onClick={e => this.toggleLevel(level)}>{level.level} ({level.messageCount})</button>;
                                })
                        }
                        </div>
                    </div>
                    <br/>
                    <table className='table table-bordered table-striped tab-content-item tab-logs-table'>
                        <thead>
                            <tr className='table-col-title-group'>
                                <th width='10%'><span className='table-col-title'>Ordinal</span></th>
                                <th width='10%'><span className='table-col-title tab-logs-table-icon-column'><FontAwesomeIcon path=''/>Level</span></th>
                                <th width='58%'><span className='table-col-title tab-logs-table-icon-column'><FontAwesomeIcon path=''/>Message</span></th>
                                <th width='10%'><span className='table-col-title'>From Start</span></th>
                                <th width='10%'><span className='table-col-title'>Duration</span></th>
                                <th width='2%' />
                            </tr>
                        </thead>
                        <tbody>
                        {
                            messages.map(message => {
                                return (
                                    <tr className='tab-logs-data-default' key={message.id}>
                                        <td>{message.ordinal}</td>
                                        <td className={Logging.getRowClass(message)}><FontAwesomeIcon path={Logging.getIconPath(message.level)} />{message.level}</td>
                                        <td className='tab-logs-table-icon-column'><LogMessage message={message} /></td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td />
                                    </tr>);
                            })
                        }
                        </tbody>
                        <tfoot>
                            <tr className='table-body-padding table-col-title-group'><th colSpan={6}></th></tr>
                        </tfoot>
                    </table>
                </div>
            );
        }
        else {
            return <div className='tab-section text-minor'>Could not find any data.</div>;
        }
    }

    private static getIconPath(level: string) {
        switch (level) {
            case 'Critical':
            case 'Error':
                return FontAwesomeIcon.paths.TimesCircle;

            case 'Warning':
                return FontAwesomeIcon.paths.Warning;

            default:
                return '';
        }
    }

    /**
     * Return the CSS class name to use for the given message
     */
    private static getRowClass(message: ILogMessage) {
        let rowClass = 'tab-logs-table-icon-column';

        switch (message.level) {
            case 'Critical':
            case 'Error':
                rowClass += ' tab-logs-data-error';
                break;
            case 'Warning':
                rowClass += ' tab-logs-data-warning';
                break;
            default:
                rowClass += ' tab-logs-data-default';
                break;
        }

        return rowClass;
    }

    private toggleLevel(level: ILoggingLevelModel) {
        this.props.componentModel.toggleLevel(level);
    }

    private toggleAll() {
        this.props.componentModel.showAll();
    }
}
