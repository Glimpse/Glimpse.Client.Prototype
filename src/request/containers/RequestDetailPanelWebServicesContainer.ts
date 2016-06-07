import { WebServices }from '../components/RequestDetailPanelWebServices';

import { connect } from 'react-redux';

// Which part of the Redux global state does our component want to receive as props?
function mapStateToProps(state, ownProps) {
  return ownProps;
}

// Which action creators does it want to receive by props?
function mapDispatchToProps(dispatch) {
  return {
  };
}

export = connect(
  mapStateToProps,
  mapDispatchToProps
)(WebServices);
