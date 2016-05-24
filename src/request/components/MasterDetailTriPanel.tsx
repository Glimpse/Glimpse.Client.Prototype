import * as React from 'react';

interface IMasterDetailTriPanelProps {
    masterPanel;
    leftDetailPanel;
    leftDetailPanelTitle: string;
    rightDetailPanel;
    rightDetailPanelTitle: string;
}

export class MasterDetailTriPanel extends React.Component<IMasterDetailTriPanelProps, {}> {
    public render() {
        return (
            <div>
                <div className='tab-detail-body master-detail-tri-panel-master'>
                {
                    this.props.masterPanel
                }
                </div>
                <div className='tab-detail-footer master-detail-tri-panel-detail'>
                    <table className='table table-details'>
                        <thead>
                            <tr>
                                <th className='table-col-title' width='50%'>{this.props.leftDetailPanelTitle}</th>
                                <th className='table-col-title' width='50%'>{this.props.rightDetailPanelTitle}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{this.props.leftDetailPanel}</td>
                                <td>{this.props.rightDetailPanel}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
