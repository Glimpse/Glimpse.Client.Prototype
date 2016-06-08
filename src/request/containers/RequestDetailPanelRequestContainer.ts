import { Request } from '../components/RequestDetailPanelRequest';

import { connect } from 'react-redux';

function mapStateToProps(state, ownProps) {
    return ownProps;
}

function mapDispatchToProps(dispatch) {
    return {
    };
}

export = connect(
    mapStateToProps,
    mapDispatchToProps
)(Request);
