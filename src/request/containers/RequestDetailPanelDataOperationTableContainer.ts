import { createSelectOperationAction } from '../actions/RequestDetailDataActions';
import { RequestDetailPanelDataOperationTable } from '../components/RequestDetailPanelDataOperationTable';
import { connect } from 'react-redux';

import * as _ from 'lodash';

function mapStateToProps(state, ownProps) {
    
    return _.assign(
        {
            selectedIndex: state.detail.data.selectedIndex
        }, 
        ownProps);
}

function mapDispatchToProps(dispatch) {
    return {
        onSelected: (index: number) => {
            dispatch(createSelectOperationAction(index));           
        }
    };
}

export const RequestDetailPanelDataOperationTableContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(RequestDetailPanelDataOperationTable);
