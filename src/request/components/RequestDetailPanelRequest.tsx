import { TabbedPanel } from './TabbedPanel';
import { TabPanel } from './TabPanel';

import _ = require('lodash');
import Highlight = require('react-highlight');
import React = require('react');

function trainCase(key: string): string {
    let newKey = '';

    for(let i = 0; i < key.length; i++) {
        if (i === 0 || key[i - 1] === '-') {
            newKey += key[i].toUpperCase();
        } else {
            newKey += key[i];
        }
    }

    return newKey;
}

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
                        { this.renderRequestResponse('Request', this.props.request) }
                        <div className='tab-request-separator' />
                        { this.renderRequestResponse('Response', this.props.response) }
                    </div>
                </div>
            );
        }
        else {
            content = <div className='tab-section text-minor'>Could not find any data.</div>;
        }

        return content;
    }

    private renderRequestResponse(title: string, requestResponse: { body: string, headers: { [key: string]: string }}) {
        return (
            <div className='tab-request-response-panel'>
                <div className='tab-request-response-title'>{title}</div>
                <br />
                <TabbedPanel>
                    <TabPanel header='Headers'>
                        { this.renderHeaders(requestResponse.headers) }
                    </TabPanel>
                    <TabPanel header='Body'>
                        { this.renderBody(requestResponse.body) }
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
            <li><span className='tab-request-header-key'>{trainCase(key)}: </span><span>{value}</span></li>
        );
    }

    private renderBody(body: string) {
        return (
            <div className='tab-request-body'>
                <Highlight className=''>{body}</Highlight>
            </div>
        );
    }
}
