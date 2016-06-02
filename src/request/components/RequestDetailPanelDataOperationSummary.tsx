import { TabbedPanel } from './TabbedPanel';
import { TabPanel } from './TabPanel';

import * as React from 'react';

export interface IRequestDetailPanelDataOperationSummaryProps {
    operation;
}

export class RequestDetailPanelDataOperationSummary extends React.Component<{}, {}> {
    public render() {
        return (
            <div className='tab-data-summary'>
                <TabbedPanel>
                    <TabPanel header='General Info'>
                    {
                        this.renderGeneralInfo()
                    }
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
    
    private renderGeneralInfo() {
        return (
            <div>Coming soon!</div>
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
