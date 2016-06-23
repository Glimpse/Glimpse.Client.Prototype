import { getMiddleware, getRequest, getResponse, getUrl } from '../selectors/RequestDetailRequestSelectors';
import { Request } from '../components/RequestDetailPanelRequest';

import { connect } from 'react-redux';

function mapStateToProps(state) {
    return {
        middleware: getMiddleware(state),
        request: getRequest(state),
        response: getResponse(state),
        url: getUrl(state)
    };
}

function mapDispatchToProps(dispatch) {
    return {
    };
}

export = connect(
    mapStateToProps,
    mapDispatchToProps
)(Request);
