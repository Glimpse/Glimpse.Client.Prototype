'use strict';

var request = require('superagent');
var glimpse = require('glimpse');

module.exports = {
    triggerGetLastestSummaries: function() {
        // TODO: need to pull this out different source (i.e. Metadata)
        var uri = '/glimpse/message-history';
        
        request
            .get(uri) 
            .set('Accept', 'application/json')
            .end(function(err, res){ 
                // this is done because we want to delay the response
                if (!FAKE_SERVER) {
                    if (res.ok) {
                        glimpse.emit('data.message.summary.found.remote', res.body);
                    }
                    else {
                        console.log('ERROR: Error reaching server for summary request')
                    }  
                }
            }); 
    },
    triggerGetDetailsFor: function(requestId) {
        // TODO: need to pull this out different source (i.e. Metadata)
        var uri = '/glimpse/message-detail/' + requestId;
        
        request
            .get(uri) 
            .set('Accept', 'application/json')
            .end(function(err, res){ 
                // this is done because we want to delay the response
                if (!FAKE_SERVER) {
                    if (res.ok) {
                        glimpse.emit('data.message.summary.found.remote', res.body);
                    }
                    else {
                        console.log('ERROR: Error reaching server for summary request')
                    }  
                }
            }); 
    }
};
