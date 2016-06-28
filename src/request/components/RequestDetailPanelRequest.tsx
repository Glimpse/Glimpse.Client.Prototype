import { TabbedPanel } from './TabbedPanel';
import { TabPanel } from './TabPanel';
import { trainCase } from '../../lib/StringUtilities';

import requestConverter = require('../repository/converter/request-converter');

import _ = require('lodash');
import Highlight = require('react-highlight');
import React = require('react');

export interface IRequestProps {
    url: string;
    request: {
        body: string;
        contentType: string;
        headers: { [key: string]: string }
    };
    response: {
        body: string;
        contentType: string;
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
                        { this.renderRequestResponse('Request', this.props.request.body, this.props.request.contentType, this.props.request.headers) }
                        <div className='tab-request-separator' />
                        { this.renderRequestResponse('Response', this.props.response.body, this.props.response.contentType, this.props.response.headers) }
                    </div>
                </div>
            );
        }
        else {
            content = <div className='tab-section text-minor'>Could not find any data.</div>;
        }

        return content;
    }

    private renderRequestResponse(title: string, body: string, contentType: string, headers: { [key: string]: string }) {
        return (
            <div className='tab-request-response-panel'>
                <div className='tab-request-response-title'>{title}</div>
                <br />
                <TabbedPanel>
                    <TabPanel header='Headers'>
                        { this.renderHeaders(headers) }
                    </TabPanel>
                    <TabPanel header='Body'>
                        { this.renderBody(body, contentType) }
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

    private renderBody(body: string, contentType: string) {
        const highlightClassName = this.getHighlightClassNameForContentType(contentType);

        return (
            <div className='tab-request-body'>
                <Highlight className={highlightClassName}>{body}</Highlight>
            </div>
        );
    }

    private getHighlightClassNameForContentType(contentType: string): string {
        const category = requestConverter.getContentTypeCategory(contentType);

        return (category && category.highlight) || '';
    }
}
