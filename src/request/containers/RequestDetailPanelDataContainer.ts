import { DataComponent } from '../components/RequestDetailPanelData';
import { IRequestState } from '../stores/IRequestState';

import { connect } from 'react-redux';

function mapStateToProps(state: IRequestState) {
    return {
        totalOperationCount: state.detail.data.operations.length
    };
}

function mapDispatchToProps(dispatch) {
    return {
    };
}

export = connect(
    mapStateToProps,
    mapDispatchToProps
)(DataComponent);
