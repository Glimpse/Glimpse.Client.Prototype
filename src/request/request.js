'use strict';

var glimpse = require('glimpse');
var requestRepository = require('./repository/request-repository');
var userRepository = require('./repository/user-repository');

function initialize() { 
    requestRepository.triggerGetLastestSummaries();
    userRepository.triggerGetLastestUsers(); 

    glimpse.emit('shell.request.ready', {});
}

glimpse.on('shell.ready', initialize);
