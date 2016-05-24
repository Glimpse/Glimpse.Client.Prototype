import { DataComponent } from '../components/RequestDetailPanelData';
import { connect } from 'react-redux';

function mapStateToProps(state) {
    return {
        operations: state.detail.data.operations
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
