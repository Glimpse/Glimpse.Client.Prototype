'use strict';

var _ = require('lodash');

module.exports = {
	getSummaryMessagesStructure: function(){
		var processItem = module.exports.getTypePayloadItem;
		var processList = module.exports.getTypePayloadList;
		
		return {
			'user-identification': processItem,
			'end-request': processItem,
			'begin-request': processItem,
			'after-action-invoked': processItem,
			'after-action-view-invoked': processItem,
			'after-execute-command': processList,
			'browser-navigation-timing': processItem
		};
	},
	getSummaryMessages: function(request) {
		var options = module.exports.getSummaryMessagesStructure();
		
		return module.exports.getTypePayloads(request, options); 
	},
	getTypePayloads: function(request, typeOptions) {
		var result = {};
		_.forEach(typeOptions, function(callback, key) {
			result[_.camelCase(key)] = callback(request, key)
		});
		
		return result;
	},
	getTypePayloadItem: function(request, type) {
		var messageIds = request.types[type]; 
		if (messageIds)	{
			return request.messages[messageIds[0]].payload;
		}
	},
	getTypePayloadList: function(request, type) {
		var messageIds = request.types[type]; 
		if (messageIds)	{
			return _.map(messageIds, function(id) { return request.messages[id].payload; });
		}
	}
};