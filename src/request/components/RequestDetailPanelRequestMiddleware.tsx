import { trainCase } from '../../lib/StringUtilities';

import * as _ from 'lodash';
import * as React from 'react';

import classNames = require('classnames');

interface IFlattenedMiddleware {
    depth: number;
    middleware: { 
        name: string, 
        packageName: string, 
        headers: { [key: string]: { value: string, isCurrent: boolean } }
    };
}

export interface IRequestMiddlewareProps {
    middleware: IFlattenedMiddleware[],
}

export class RequestMiddleware extends React.Component<IRequestMiddlewareProps, {}> {
    public render() {
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
                <td>{this.renderMiddlewareHeaders(middleware.middleware.headers)}</td>
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

    private renderMiddlewareHeaders(headers: { [key: string]: { value: string } }) {
        return (
            <div className='tab-request-middleware-headers'>
                <ul>
                    { 
                        _(headers)
                            .map((value, key) => { return { key: key, value: value }; })
                            .sortBy(pair => pair.key)
                            .map(pair => this.renderMiddlewareHeader(pair.key, pair.value.value, pair.value.isCurrent))
                            .value() 
                    }
                </ul>
            </div>
        );
    }

    private renderMiddlewareHeader(key: string, value: string, isCurrent: boolean) {
        return (
            <li key={key}><span className='tab-request-middleware-header-key'>{trainCase(key)}: </span><span className={classNames({'tab-request-middleware-header-overwritten': !isCurrent})}>{value}</span></li>
        );
    }
}
