import { DataComponent } from '../components/RequestDetailPanelData';
import { connect } from 'react-redux';

function mapStateToProps(state) {
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
