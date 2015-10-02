'use strict';

var _ = require('lodash');
var glimpse = require('glimpse');

var PanelGeneric = require('./components/request-detail-panel-generic');

var _tabs = {};

module.exports = {
    resolveTab: function (key) {
        // TODO: strategy needs to be improved
        if (_tabs[key]) {
            return _tabs[key];
        }

        // used when there is no tab registerd to handel the result
        return {
            key: 'generic',
            component: PanelGeneric
        };
    },
    registerTab: function (tab) {
        // TODO: validate key being in place
        _tabs[tab.key] = tab;

        glimpse.emit('shell.request.tab.added', { tab: tab });
    },
    registeredTabs: function() {
        return _tabs;
    }
};

// TODO: Need to come up with a better self registration process
require('./components/request-detail-panel-execution');
require('./components/request-detail-panel-trace');
require('./components/request-detail-panel-messages');
