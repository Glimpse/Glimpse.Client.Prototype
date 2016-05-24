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
                <div className='master-detail-tri-panel-master'>
                {
                    this.props.masterPanel
                }
                </div>
                <div className='master-detail-tri-panel-detail'>
                    <table>
                        <thead>
                            <tr>
                                <th>{this.props.leftDetailPanelTitle}</th>
                                <th>{this.props.rightDetailPanelTitle}</th>
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
