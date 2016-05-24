const util = require('../../lib/util');

import * as React from 'react';

export class RequestDetailPanelDataOperationTable extends React.Component<{ operations: ({})[] }, {}> {
    public render() {
        return (
            <table className='tab-data-operation-table'>
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
        );
    }
    
    public renderOperation(operation, index) {
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
