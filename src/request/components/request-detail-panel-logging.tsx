'use strict';

import { ILogMessage } from '../messages/ILogMessage';
import { ILoggingComponentModel, ILoggingLevelModel } from '../component-models/ILoggingComponentModel';

import React = require('react');

export interface ILoggingProps {
    request;
    viewModel: ILoggingComponentModel;
}

export interface ILoggingState {
    viewModel: ILoggingComponentModel;
}

/**
 * React class to for the console log messages tab
 */
export class Logging extends React.Component<ILoggingProps, ILoggingState> {
    private toggleLevel(level: ILoggingLevelModel) {
        this.state.viewModel.toggleLevel(level);

        this.setState({ viewModel: this.state.viewModel });
    }

    private toggleAll() {
        this.state.viewModel.toggleAll();

        this.setState({ viewModel: this.state.viewModel });
    }

    public constructor(props?: ILoggingProps) {
        super(props);

        this.state = {
            viewModel: props.viewModel
        };
    }

    public render() {

        if (!this.state.viewModel.isEmpty) {
            const messages = this.state.viewModel.messages;
            return (
                <div className='tab-content'>
                    <h3>{messages.length} {messages.length === 1 ? 'Message' : 'Messages'}</h3>
                    <div className='flex'>
                        <input type='checkbox' checked={this.state.viewModel.showAll} onChange={e => this.toggleAll()}>Show all</input>
                        <div className='flex'>
                            {
                                _.map(this.state.viewModel.levels,
                                    level => {
                                        return <input type='checkbox' checked={level.shown} onChange={e => this.toggleLevel(level)}>{level.level} ({level.messages.length})</input>;
                                    })
                            }
                        </div>
                    </div>
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
                        <tfoot>
                            <tr className='table-body-padding table-col-title-group'><th colSpan='5'></th></tr>
                        </tfoot>
                        <tbody>
                        {messages.map(function(message, index) {
                            const className = Logging.getRowClass(message);

                            return (
                                <tr className={className} key={message.id}>
                                    <td>{index + 1}</td>
                                    <td>{message.level}</td>
                                    <td>{message.message}</td>
                                    <td>-</td>
                                    <td>-</td>
                                </tr>);
                        }) }
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
}
