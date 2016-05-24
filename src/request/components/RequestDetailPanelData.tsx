import * as React from 'react';

export class DataComponent extends React.Component<{ messages: ({})[] }, {}> {
    public render() {
        return (
            <div className='tab-data-operation-count'>{this.getTotalOperationCountText()}</div>
        );
    }
    
    private getTotalOperationCountText() {
        const totalOperationCount = this.props.messages.length;
        
        return totalOperationCount + (totalOperationCount === 1 ? ' Operation' : ' Operations');
    }
}
