import { showAllAction, toggleLevelAction } from '../actions/LoggingActions';
import { ILoggingProps, Logging } from '../components/request-detail-panel-logging';
import { getFilteredMessages, getFilters, getTotalMessageCount  } from '../selectors/LoggingSelectors';

import * as React from 'react';
import { connect } from 'react-redux';

// Which part of the Redux global state does our component want to receive as props?
function mapStateToProps(state) {
  return {
    filteredMessages: getFilteredMessages(state),
    filters: getFilters(state),
    totalMessageCount: getTotalMessageCount(state)
  };
}

// Which action creators does it want to receive by props?
function mapDispatchToProps(dispatch) {
  return {
    onToggleFilter: (filterIndex: number) => dispatch(toggleLevelAction(filterIndex)),
    onShowAll: () => dispatch(showAllAction(undefined))
  };
}

export = connect(
  mapStateToProps,
  mapDispatchToProps
)(Logging);
