import { MasterDetailTriPanel } from './MasterDetailTriPanel';

const util = require('../../lib/util');

import * as React from 'react';

export class DataComponent extends React.Component<{ operations: ({})[] }, {}> {
    public render() {
        return (
            <div className='tab-data'>
                <MasterDetailTriPanel masterPanel={this.renderMaster()} leftDetailPanel={this.renderLeftDetail()} leftDetailPanelTitle='Command' rightDetailPanel={this.renderRightDetail()} rightDetailPanelTitle='Summary' />
            </div>
        );
    }
    
    private renderMaster() {
        return (
            <div className='tab-data-master'>
                <div className='tab-data-operation-count'>{this.getTotalOperationCountText()}</div>
                <table>
                    <thead>
                        <tr>
                            <th width='10%'>Ordinal</th>
                            <th width='10%'>Database</th>
                            <th width='48%'>Command</th>
                            <th width='10%'>Duration</th>
                            <th width='10%'>Operation</th>
                            <th width='10%'>Records</th>
                            <th width='2%' />
                        </tr>
                    </thead>
                    <tbody>
                    {
                        this.props.operations.map(this.renderOperation)
                    }
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colSpan={7} />
                        </tr>
                    </tfoot>
                </table>
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
    
    private renderOperation(operation, index) {
        return (
            <tr>
                <td>{index + 1}</td>
                <td>{operation.database}</td>
                <td>{operation.command}</td>
                <td>{util.timeOrEmpty(operation.duration)}</td>
                <td>{operation.operation}</td>
                <td>{operation.recordCount}</td>
                <td />
            </tr>
        );
    }
}
