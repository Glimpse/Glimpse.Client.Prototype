import { TabbedPanel } from './TabbedPanel';
import { TabPanel } from './TabPanel';
import { trainCase } from '../../lib/StringUtilities';

import _ = require('lodash');
import Highlight = require('react-highlight');
import React = require('react');
import parseUrl = require('url-parse');

export interface IRequestProps {
    url: string;
    request: {
        body: string;
        formData: { [key: string]: string };
        headers: { [key: string]: string };
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
            const parsedUrl = parseUrl(this.props.url, /* parse query string */ true);

            content = (
                <div className='tab-request'>
                    <div className='tab-request-response'>
                        { this.renderRequestResponse('Request', this.props.request.body, this.props.request.headers, parsedUrl.query, this.props.request.formData) }
                        <div className='tab-request-separator' />
                        { this.renderRequestResponse('Response', this.props.response.body, this.props.response.headers) }
                    </div>
                </div>
            );
        }
        else {
            content = <div className='tab-section text-minor'>Could not find any data.</div>;
        }

        return content;
    }

    private renderRequestResponse(title: string, body: string, headers: { [key: string]: string }, query?: { [key: string]: string }, formData?: { [key: string]: string }) {
        const panels = [
            <TabPanel header='Headers'>
                { this.renderHeaders(headers) }
            </TabPanel>,
            <TabPanel header='Body'>
                { this.renderBody(body) }
            </TabPanel>
        ];

        if (!_.isEmpty(query) || !_.isEmpty(formData)) {
            panels.push(
                <TabPanel header='Params'>
                    { this.renderParams(query, formData) }
                </TabPanel>
            );
        }
        
        return (
            <div className='tab-request-response-panel'>
                <div className='tab-request-response-title'>{title}</div>
                <br />
                <TabbedPanel>
                    { panels }
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

    private renderParams(query: { [key: string]: string }, formData: { [key: string]: string }) {
        return (
            <div className='tab-request-params'>
                { !_.isEmpty(query) ? this.renderParameterSet('Query String', query) : null }
                { !_.isEmpty(formData) ? this.renderParameterSet('Form Data', formData) : null }
            </div>
        );
    }

    private renderParameterSet(title: string, set: { [key: string]: string }) {
        return (
            <div className='tab-request-parameter-set'>
                <div>{title}</div>
                <ul>
                    { _.map(set, (value, key) => this.renderParameter(key, value)) }
                </ul>
            </div>
        );
    }

    private renderParameter(key: string, value: string) {
        return (
            <li key={key}><span className='tab-request-parameter-key'>{key}: </span><span>{value}</span></li>
        );
    }
}
