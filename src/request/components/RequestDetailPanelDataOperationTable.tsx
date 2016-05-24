const util = require('../../lib/util');

import * as React from 'react';

const classNames = require('classnames');

interface IRequestDetailPanelDataOperationTableProps {
    operations: ({})[],
    selectedIndex: number,
    
    onSelected: (index: number) => void
}

export class RequestDetailPanelDataOperationTable extends React.Component<IRequestDetailPanelDataOperationTableProps, {}> {
    public render() {
        return (
            <table className='table table-bordered table-striped table-selectable'>
                <thead>
                    <tr className='table-col-title-group'>
                        <th width='10%'><span className='table-col-title'>Ordinal</span></th>
                        <th width='10%'><span className='table-col-title'>Database</span></th>
                        <th width='48%'><span className='table-col-title'>Command</span></th>
                        <th width='10%'><span className='table-col-title'>Duration</span></th>
                        <th width='10%'><span className='table-col-title'>Operation</span></th>
                        <th width='10%'><span className='table-col-title'>Records</span></th>
                        <th width='2%' />
                    </tr>
                </thead>
                <tbody>
                {
                    this.props.operations.map((operation, index) => this.renderOperation(operation, index))
                }
                </tbody>
                <tfoot>
                    <tr className='table-body-padding table-col-title-group'>
                        <th colSpan={7} />
                    </tr>
                </tfoot>
            </table>
        );
    }
    
    public renderOperation(operation, index: number) {
        return (
            <tr className={classNames({ selected: index === this.props.selectedIndex })} key={index} onClick={e => this.props.onSelected(index)}>
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
