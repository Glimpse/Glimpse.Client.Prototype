import { TabbedPanel } from './TabbedPanel';
import { TabPanel } from './TabPanel';
import { trainCase } from '../../lib/StringUtilities';

import _ = require('lodash');
import Highlight = require('react-highlight');
import React = require('react');

interface IFlattenedMiddleware {
    depth: number;
    middleware: { 
        name: string, 
        packageName: string, 
        headers: { [key: string]: string }
    };
}

export interface IRequestProps {
    url: string;
    middleware: IFlattenedMiddleware[],
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
                            <th width='25%'><span className='table-col-title'>Name</span></th>
                            <th width='20%'><span className='table-col-title'>Type</span></th>
                            <th width='10%'><span className='table-col-title'>Modify</span></th>
                            <th width='25%'><span className='table-col-title'>Parameter</span></th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        { this.props.middleware.map((middlewareRow, index) => this.renderMiddlewareRow(index + 1, middlewareRow)) }      
                    </tbody>
                </table>
            </div>
        );
    }

    private renderMiddlewareRow(ordinal: number, middleware: IFlattenedMiddleware) {
        return (
            <tr>
                <td>{ordinal}</td>
                <td>{this.renderName(middleware.middleware.name, middleware.depth)}</td>                            
                <td>{middleware.middleware.packageName}</td>
                <td>{_.size(middleware.middleware.headers) > 0 ? 'Header' : '-'}</td>
                <td>{this.renderHeaders(middleware.middleware.headers)}</td>
                <td />
            </tr>
        );
    }

    private renderName(name: string, depth: number) {
        return (
            <div>
                {this.renderIndent(depth)}<span>{name}</span>
            </div>
        )
    }

    private renderIndent(depth: number) {
        if (depth > 0) {
            const spans = [];

            for (let i = 0; i < depth; i++) {
                spans.push(<span className='tab-request-middleware-indent' />);
            }

            return spans;
        }
        else {
            return null;
        }
    }
}
