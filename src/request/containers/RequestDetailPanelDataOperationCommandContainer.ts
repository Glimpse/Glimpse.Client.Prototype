import { RequestDetailPanelDataOperationCommand } from '../components/RequestDetailPanelDataOperationCommand';
import { connect } from 'react-redux';

function mapStateToProps(state, ownProps) {
    const operation = state.detail.data.operations[state.detail.data.selectedIndex];

    return {
        command: operation ? operation.command : '',
        language: 'sql' // TODO: Use a mapping from database type.
    }    
}

function mapDispatchToProps(dispatch) {
    return {
    };
}

export const RequestDetailPanelDataOperationCommandContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(RequestDetailPanelDataOperationCommand);
