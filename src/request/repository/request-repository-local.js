'use strict';

var glimpse = require('glimpse');
var store = require('store');

var _storeSummaryKey = 'glimpse.data.summary.local';
var _storeDetailKey = 'glimpse.data.request.local';
var _storeDetailIndex = 'glimpse.data.request.local.index';

// Store Summies: Found from Remote or Stream
(function () {
    // TODO: Needs to be reviewed to see if we need to store
    //       this in memory or not, should just be able to work
    //       with store each time its needed.
    var storeSummary;

    function storeFoundSummary(data) {
        storeSummary = store.get(_storeSummaryKey) || [];
        for (var i = 0; i < data.length; i++) {
            var request = data[i];
            storeSummary.unshift(request);
        }
        flush();
        store.set(_storeSummaryKey, storeSummary);
    }

    function flush() {
        // TODO: Doesn't look like its flushing back to store
        while (storeSummary.length > 100) {
            storeSummary.pop();
        }
    }

    glimpse.on('data.request.summary.found.remote', storeFoundSummary);
    glimpse.on('data.request.summary.found.stream', storeFoundSummary);
})();

// Store Summies: Found from Remote
(function () {
    // TODO: Needs to be reviewed to see if we need to store
    //       this in memory or not, should just be able to work
    //       with store each time its needed.
    var storeDetail;
    var storeDetailIndex;

    function storeFoundDetail(data) {
        storeDetail = store.get(_storeDetailKey) || {};
        storeDetailIndex = store.get(_storeDetailIndex) || [];
        storeDetail[data.id] = data;
        storeDetailIndex.unshift(data.id);
        flush();
        store.set(_storeDetailKey, storeDetail);
        store.set(_storeDetailIndex, storeDetailIndex);
    }

    function flush() {
        // TODO: Doesn't look like its flushing back to store
        while (storeDetailIndex.length > 10) {
            var id = storeDetailIndex.pop();
            delete storeDetail[id];
        }
    }

    glimpse.on('data.request.detail.found.remote', storeFoundDetail);
})();

module.exports = {
    triggerGetLastestSummaries: function () {
        var data = store.get(_storeSummaryKey);
        if (data) {
            glimpse.emit('data.request.summary.found.local', data);
        }
    },
    triggerGetDetailsFor: function (requestId) {
        var data = store.get(_storeDetailKey);
        if (data) {
            var requestDetail = data[requestId];
            if (requestDetail) {
                glimpse.emit('data.request.detail.found.local', requestDetail);
            }
        }
    }
};
