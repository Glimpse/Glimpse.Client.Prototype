'use strict';

var _ = require('lodash');
var glimpse = require('glimpse');

// store Found Summary
(function () {
    function processFoundSummary(requestRepositoryPayload) {
        var messages = requestRepositoryPayload.newMessageTypes['user-identification'];
        if (messages) {
            var messageIndex = _.indexBy(messages, 'context.id');
            
            var matchedData = [];
            _.forEach(requestRepositoryPayload.affectedRequests, function(request) {
                var message = messageIndex[request.id];
                if (message) {
                    matchedData.push({ request: request, user: message });
                }
            });
            
            var userRepositoryMessage = {
                userRequests: matchedData
            };
            
            glimpse.emit('data.user.detail.found.internal', userRepositoryMessage);
        }
    }
 
    glimpse.on('data.request.summary.found.message', processFoundSummary);
    glimpse.on('data.request.detail.found.message', processFoundSummary);
    // TODO: If we switch to storing session in local storage this needs to be removed
    glimpse.on('data.request.summary.found.local', processFoundSummary);
})();
