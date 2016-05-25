import { getSelectedOperation } from '../selectors/RequestDetailDataSelectors';
import { IRequestState } from '../stores/IRequestState';
import { RequestDetailPanelDataOperationCommand, IRequestDetailPanelDataOperationCommandProps } from '../components/RequestDetailPanelDataOperationCommand';

import { connect } from 'react-redux';

function mapStateToProps(state: IRequestState, ownProps): IRequestDetailPanelDataOperationCommandProps {
    const operation = getSelectedOperation(state);

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
