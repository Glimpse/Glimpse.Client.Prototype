'use strict';

require('./request-store-manage');

var cacheRequestRepository = require('./request-repository-cache');
var localRequestRepository = require('./request-repository-local');
var messageRequestRepository = require('./request-repository-message');
var messageRepository = require('./message-repository');

module.exports = {
    triggerGetLastestSummaries: function () {
        // find any messages from server
        messageRepository.triggerGetLastestSummaries();

        // make sure we get new messages from server as they happen
        messageRepository.subscribeToLastestSummaries();
        
        if (!FAKE_SERVER) {
            // find any requests in stroage
            localRequestRepository.triggerGetLastestSummaries();
        }
    },
    triggerGetDetailsFor: function (requestId) {
        // find the request in cache
        cacheRequestRepository.triggerGetDetailsFor(requestId);
        
        // find the messages from server
        messageRepository.triggerGetDetailsFor(requestId);
        
        // make sure we get updates for the request as they happen
        messageRepository.subscribeToDetailsFor(requestId);
    }
};
