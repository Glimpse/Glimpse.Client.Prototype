'use strict';

var glimpse = require('glimpse');
var requestRepository = require('./repository/request-repository.js');
var userRepository = require('./repository/user-repository.js');

function initialize() {
    if (!FAKE_SERVER) {
        requestRepository.triggerGetLastestSummaries();
        userRepository.triggerGetLastestUsers();
    }

    glimpse.emit('shell.request.ready', {});
}

glimpse.on('shell.ready', initialize);
