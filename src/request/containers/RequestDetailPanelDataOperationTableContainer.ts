import { RequestDetailPanelDataOperationTable } from '../components/RequestDetailPanelDataOperationTable';
import { connect } from 'react-redux';

function mapStateToProps(state, ownProps) {
    return ownProps;
}

function mapDispatchToProps(state) {
    return {
    };
}

export const RequestDetailPanelDataOperationTableContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(RequestDetailPanelDataOperationTable);
