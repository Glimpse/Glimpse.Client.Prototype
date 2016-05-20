import * as LoggingActions from '../actions/LoggingActions';
import { ILoggingProps, Logging } from '../components/request-detail-panel-logging';
import store from '../stores/RequestStore';

import * as React from 'react';

export class LoggingContainer extends React.Component<ILoggingProps, {}> {
    public render() {
        return <Logging loggingState={store.getState()} onToggleFilter={this.onToggleFilter} onShowAll={this.onShowAll} />;
    }
    
    private onToggleFilter(filterIndex: number) {
        store.dispatch(LoggingActions.createToggleLevelAction(filterIndex));
    }
    
    private onShowAll() {
        store.dispatch(LoggingActions.createShowAllAction());
    }
}
