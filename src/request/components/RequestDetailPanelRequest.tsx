import { TabbedPanel } from './TabbedPanel';
import { TabPanel } from './TabPanel';
import { trainCase } from '../../lib/StringUtilities';

import _ = require('lodash');
import Highlight = require('react-highlight');
import React = require('react');

export interface IRequestProps {
    url: string;
    request: {
        body: string;
        headers: { [key: string]: string }
    };
    response: {
        body: string;
        headers: { [key: string]: string };
    };
}

export class Request extends React.Component<IRequestProps, {}> {
    public render() {
        let content;
        if (this.props.url && this.props.request && this.props.response) {
            content = (
                <div className='tab-request'>
                    <div className='tab-request-response'>
                        { this.renderRequestResponse('Request', this.props.request.body, this.props.request.headers) }
                        <div className='tab-request-separator' />
                        { this.renderRequestResponse('Response', this.props.response.body, this.props.response.headers) }
                    </div>
                    { this.renderMiddleware() }
                </div>
            );
        }
        else {
            content = <div className='tab-section text-minor'>Could not find any data.</div>;
        }

        return content;
    }

    private renderRequestResponse(title: string, body: string, headers: { [key: string]: string }) {
        return (
            <div className='tab-request-response-panel'>
                <div className='tab-request-title'>{title}</div>
                <br />
                <TabbedPanel>
                    <TabPanel header='Headers'>
                        { this.renderHeaders(headers) }
                    </TabPanel>
                    <TabPanel header='Body'>
                        { this.renderBody(body) }
                    </TabPanel>
                </TabbedPanel>
            </div>
        );     
    }

    private renderHeaders(headers: { [key: string]: string}) {
        return (
            <div className='tab-request-headers'>
                <ul>
                    { _.map(headers, (value, key) => this.renderHeader(key, value)) }
                </ul>
            </div>
        );
    }

    private renderHeader(key: string, value: string) {
        return (
            <li key={key}><span className='tab-request-header-key'>{trainCase(key)}: </span><span>{value}</span></li>
        );
    }

    private renderBody(body: string) {
        return (
            <div className='tab-request-body'>
                <Highlight className=''>{body}</Highlight>
            </div>
        );
    }

    private renderMiddleware() {
        return (
            <div className='tab-request-middleware'>
                <div className='tab-request-title'>Middleware</div>
                <br />
                <table className='table table-bordered table-striped table-selectable tab-request-middleware-table'>
                    <thead>
                        <tr className='table-col-title-group'>
                            <th width='10%'><span className='table-col-title'>Ordinal</span></th>
                            <th width='20%'><span className='table-col-title'>Type</span></th>
                            <th width='20%'><span className='table-col-title'>Name</span></th>
                            <th width='10%'><span className='table-col-title'>Modify</span></th>
                            <th width='20%'><span className='table-col-title'>Parameter</span></th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>Body-Parser</td>
                            <td>Json Body Parser</td>                            
                            <td>Header</td>
                            <td>Cache-Control: private</td>
                            <td />
                        </tr>                        
                        <tr>
                            <td>2</td>
                            <td>Body-Parser</td>
                            <td>URL Encoded Body Parser</td>                            
                            <td>Header</td>
                            <td>Cache-Control: private</td>
                            <td />
                        </tr>                        
                    </tbody>
                </table>
            </div>
        );
    }
}
