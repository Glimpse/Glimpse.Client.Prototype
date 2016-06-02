import { RequestDetailPanelDataOperationSummaryGeneralInfo } from './RequestDetailPanelDataOperationSummaryGeneralInfo';
import { TabbedPanel } from './TabbedPanel';
import { TabPanel } from './TabPanel';

import * as React from 'react';

export interface IRequestDetailPanelDataOperationSummaryProps {
    operation;
}

export class RequestDetailPanelDataOperationSummary extends React.Component<IRequestDetailPanelDataOperationSummaryProps, {}> {
    public render() {
        return (
            <div className='tab-data-operation-summary'>
                <TabbedPanel>
                    <TabPanel header='General Info'>
                        <RequestDetailPanelDataOperationSummaryGeneralInfo databaseType={this.props.operation.operation.database} databaseName={this.props.operation.operation.databaseName} serverName={this.props.operation.operation.serverName} />
                    </TabPanel>
                    <TabPanel header='Parameters'>
                    {
                        this.renderParameters()   
                    }
                    </TabPanel>
                    <TabPanel header='Connection'>
                    {
                        this.renderConnection()
                    }
                    </TabPanel>
                </TabbedPanel>
            </div>
        );
    }
    
    private renderParameters() {
        return (
            <div>Coming soon!</div>
        );
    }

    private renderConnection() {
        return (
            <div>Coming soon!</div>
        );
    }
}
