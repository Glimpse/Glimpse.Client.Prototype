import { MasterDetailTriPanel } from './MasterDetailTriPanel';
import { RequestDetailPanelDataOperationTableContainer } from '../containers/RequestDetailPanelDataOperationTableContainer';

import * as React from 'react';

export class DataComponent extends React.Component<{ operations: ({})[] }, {}> {
    public render() {
        if (this.props.operations.length > 0) {
            return (
                <div className='tab-content tab-data'>
                    <MasterDetailTriPanel masterPanel={this.renderMaster()} leftDetailPanel={this.renderLeftDetail()} leftDetailPanelTitle='Command' rightDetailPanel={this.renderRightDetail()} rightDetailPanelTitle='Summary' />
                </div>
            );
        }
        else {
            return <div className='tab-section text-minor'>Could not find any data.</div>;
        }
    }
    
    private renderMaster() {
        return (
            <div className='tab-data-master'>
                <div className='tab-data-operation-count'>{this.getTotalOperationCountText()}</div>
                <br />
                <RequestDetailPanelDataOperationTableContainer operations={this.props.operations} />
            </div>
        );
    }
    
    private renderLeftDetail() {
        return null;
    }
    
    private renderRightDetail() {
        return null;
    }
    
    private getTotalOperationCountText() {
        const totalOperationCount = this.props.operations.length;
        
        return totalOperationCount + (totalOperationCount === 1 ? ' Operation' : ' Operations');
    }
}
