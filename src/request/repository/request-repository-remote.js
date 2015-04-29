'use strict';

var glimpse = require('glimpse');
var request = require('superagent');

//Not sure where the best place for this is
if(FAKE_SERVER){
    //TODO: override request
}

module.exports = {
    triggerGetLastestSummaries: function () {
        var glimpseUrl = 'NOTSURE';
        request.get(glimpseUrl, function(res){
            glimpse.emit('data.request.summary.found.remote', res);
        });
    },
    triggerGetDetailsFor: function (requestId) {

        var glimpseUrl = 'NOTSURE?' + requestId;
        request.get(glimpseUrl, function(res){
            glimpse.emit('data.request.detail.found.remote', res);
        });
    }
};
