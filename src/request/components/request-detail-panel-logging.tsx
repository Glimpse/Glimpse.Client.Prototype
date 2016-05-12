'use strict';

import { ILogMessage } from '../messages/ILogMessage';
import { ILoggingComponentModel, ILoggingLevelModel } from '../component-models/ILoggingComponentModel';

import _ = require('lodash');
import React = require('react');

export interface ILoggingProps {
    componentModel: ILoggingComponentModel;
}

const FA_WARNING_PATH = 'M1024 1375v-190q0-14-9.5-23.5t-22.5-9.5h-192q-13 0-22.5 9.5t-9.5 23.5v190q0 14 9.5 23.5t22.5 9.5h192q13 0 22.5-9.5t9.5-23.5zm-2-374l18-459q0-12-10-19-13-11-24-11h-220q-11 0-24 11-10 7-10 21l17 457q0 10 10 16.5t24 6.5h185q14 0 23.5-6.5t10.5-16.5zm-14-934l768 1408q35 63-2 126-17 29-46.5 46t-63.5 17h-1536q-34 0-63.5-17t-46.5-46q-37-63-2-126l768-1408q17-31 47-49t65-18 65 18 47 49z';

const FA_TIMES_CIRCLE_PATH = 'M1277 1122q0-26-19-45l-181-181 181-181q19-19 19-45 0-27-19-46l-90-90q-19-19-46-19-26 0-45 19l-181 181-181-181q-19-19-45-19-27 0-46 19l-90 90q-19 19-19 46 0 26 19 45l181 181-181 181q-19 19-19 45 0 27 19 46l90 90q19 19 46 19 26 0 45-19l181-181 181 181q19 19 45 19 27 0 46-19l90-90q19-19 19-46zm387-226q0 209-103 385.5t-279.5 279.5-385.5 103-385.5-103-279.5-279.5-103-385.5 103-385.5 279.5-279.5 385.5-103 385.5 103 279.5 279.5 103 385.5z';

class FontAwesomeIcon extends React.Component<{ path: string }, {}> {
    public render() {
        return <svg className='fa-svg' viewBox='0 0 1792 1792' xmlns='http://www.w3.org/2000/svg'><path className='fa-svg-path' d={this.props.path}/></svg>;
    }
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
                    <table className='table table-bordered table-striped tab-content-item'>
                        <thead>
                            <tr className='table-col-title-group'>
                                <th width='5%'><span className='table-col-title'>Ordinal</span></th>
                                <th width='15%'><span className='table-col-title'><FontAwesomeIcon path=''/>Level</span></th>
                                <th width='40%'><span className='table-col-title'>Message</span></th>
                                <th width='10%'><span className='table-col-title'>From Start</span></th>
                                <th width='10%'><span className='table-col-title'>Duration</span></th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                        {
                            messages.map(message => {
                                return (
                                    <tr className='tab-logs-data-default' key={message.id}>
                                        <td>{message.ordinal}</td>
                                        <td className={Logging.getRowClass(message)}><FontAwesomeIcon path={Logging.getIconPath(message.level)} />{message.level}</td>
                                        <td>{message.spans.map(span => <span className={span.wasReplaced ? 'tab-logs-data-replaced-region' : ''}>{span.text}</span>)}</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td />
                                    </tr>);
                            })
                        }
                        </tbody>
                        <tfoot>
                            <tr className='table-body-padding table-col-title-group'><th colSpan='6'></th></tr>
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
                return FA_TIMES_CIRCLE_PATH;

            case 'Warning':
                return FA_WARNING_PATH;

            default:
                return '';
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
        this.props.componentModel.toggleLevel(level);
    }

    private toggleAll() {
        this.props.componentModel.showAll();
    }
}
