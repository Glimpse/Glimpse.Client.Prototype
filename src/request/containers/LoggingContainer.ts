import * as LoggingActions from '../actions/LoggingActions';
import { ILoggingProps, Logging } from '../components/request-detail-panel-logging';
import { getTotalMessageCount } from '../selectors/LoggingSelectors';

import * as React from 'react';
import { connect } from 'react-redux';

// Which part of the Redux global state does our component want to receive as props?
function mapStateToProps(state) {
  return {
    loggingState: state,
    totalMessageCount: getTotalMessageCount(state)
  };
}

// Which action creators does it want to receive by props?
function mapDispatchToProps(dispatch) {
  return {
    onToggleFilter: (filterIndex: number) => dispatch(LoggingActions.createToggleLevelAction(filterIndex)),
    onShowAll: dispatch(LoggingActions.createShowAllAction())
  };
}

export = connect(
  mapStateToProps,
  mapDispatchToProps
)(Logging);
