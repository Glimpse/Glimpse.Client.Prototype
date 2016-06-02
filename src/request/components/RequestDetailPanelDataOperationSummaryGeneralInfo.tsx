import * as React from 'react';

export interface IRequestDetailPanelDataOperationSummaryGeneralInfoProps {
    databaseType: string;
    databaseName: string;
    serverName: string;
}

export class RequestDetailPanelDataOperationSummaryGeneralInfo extends React.Component<IRequestDetailPanelDataOperationSummaryGeneralInfoProps, {}> {
    public render() {
        return (
            <div className='tab-data-operation-summary-general-info'>
                <span className='label'>Database: </span><span>{this.props.databaseType}</span>
                <br />
                <br />
                <span className='label'>Database Name: </span><span>{this.props.databaseName}</span>
                <br />
                <br />
                <span className='label'>Server: </span><span>{this.props.serverName}</span>
            </div>
        );
    }    
}
