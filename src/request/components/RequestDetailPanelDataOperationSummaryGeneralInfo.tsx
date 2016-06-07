import * as React from 'react';

export interface IRequestDetailPanelDataOperationSummaryGeneralInfoProps {
    databaseType: string;
    databaseName: string;
    serverName: string;
}

export interface IRequestDetailPanelDataOperationSummaryGeneralInfoDispatchProps {
    onSeeConnection: () => void;
    onSeeTransaction: () => void;
}

interface IRequestDetailPanelDataOperationSummaryGeneralInfoCombinedProps extends IRequestDetailPanelDataOperationSummaryGeneralInfoProps, IRequestDetailPanelDataOperationSummaryGeneralInfoDispatchProps {    
}

export class RequestDetailPanelDataOperationSummaryGeneralInfo extends React.Component<IRequestDetailPanelDataOperationSummaryGeneralInfoCombinedProps, {}> {
    public render() {
        return (
            <div className='tab-data-operation-summary-general-info'>
                <span className='label'>Connection: </span><a href='#' onClick={e => this.props.onSeeConnection()}>See details</a>
                <br />
                <br />
                <span className='label'>Transaction: </span><a href='#' onClick={e => this.props.onSeeTransaction()}>See details</a>
                <br />
                <br />
                <span className='label'>Database: </span><span>{this.props.databaseType}</span>
                <br />
                <br />
                <span className='label'>Database Name: </span><span>{this.props.databaseName || '-'}</span>
                <br />
                <br />
                <span className='label'>Server: </span><span>{this.props.serverName || '-'}</span>
            </div>
        );
    }
}
