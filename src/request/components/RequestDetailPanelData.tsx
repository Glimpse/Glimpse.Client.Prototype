import { MasterDetailTriPanel } from './MasterDetailTriPanel';
import { RequestDetailPanelDataOperationCommandContainer } from '../containers/RequestDetailPanelDataOperationCommandContainer';
import { RequestDetailPanelDataOperationTableContainer } from '../containers/RequestDetailPanelDataOperationTableContainer';

import * as React from 'react';
import Highlight = require('react-highlight');


export class DataComponent extends React.Component<{ totalOperationCount: number }, {}> {
    public render() {
        return (
            <div className='tab-data'>
            {
                this.props.totalOperationCount > 0
                    ? <MasterDetailTriPanel masterPanel={this.renderMaster()} leftDetailPanel={this.renderLeftDetail()} leftDetailPanelTitle='Command' rightDetailPanel={this.renderRightDetail()} rightDetailPanelTitle='Summary' />
                    : <div className='tab-section text-minor'>Could not find any data.</div>  
            }
            </div>
        );
    }
    
    private renderMaster() {
        return (
            <div className='tab-data-master'>
                <div className='tab-data-operation-count'>{this.getTotalOperationCountText()}</div>
                <br />
                <RequestDetailPanelDataOperationTableContainer />
            </div>
        );
    }
    
    private renderLeftDetail() {
        return (
            <RequestDetailPanelDataOperationCommandContainer />
        )
    }
    
    private renderRightDetail() {
        return null;
    }
    
    private getTotalOperationCountText() {
        return this.props.totalOperationCount + (this.props.totalOperationCount === 1 ? ' Operation' : ' Operations');
    }
}
