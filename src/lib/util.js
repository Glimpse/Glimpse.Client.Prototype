'use strict';

var _ = require('lodash');

module.exports = {
    isArray: function (data) {
        return (data instanceof Array);
    },
    isNumeric: function (data) {
        return isNaN(parseInt(data, 10));
    },
    isObject: function (data) {
        return data !== null && (typeof data === 'object');
    },
    isEmpty: function (data) {
        return _.isEmpty(data);
    },
    eachMap: function (data, callback) {
        var result = [];

        for (var key in data) {
            result.push(callback(key, data[key]));
        }

        return result;
    },
    smartCasing: function (data) {
        var result = '';
        var previous = '';
        var blacklist = [ ' ', '-', '/', '_' ];
        var isNumeric = this.isNumeric;

        if (data === null) {
            return data;
        }

        for (var i = 0; i < data.length; i++) {
            var current = data[i];
            var next = data[i + 1];

            if (blacklist.indexOf(current) > -1) {
                return data;
            }

            if (i === 0 ||
                ((isNumeric(previous) && !isNumeric(current)) ||
                (!isNumeric(previous) && isNumeric(current)) ||
                (!isNumeric(current) && current.toUpperCase() === current &&
                    (previous.toUpperCase() !== previous ||
                        (next && next.toUpperCase() !== next))))) {
                result = i === 0 ? current.toUpperCase() : (result + ' ' + current.toUpperCase());
            } else {
                result += current;
            }

            previous = current;
        }

        return result;
    },
    timeOrEmpty: function(value) {
        return value !== null && value !== undefined ? value + ' ms' : '-';
    },
    getQueryStringParam: function(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == variable) {
                return decodeURIComponent(pair[1]);
            }
        }
        
        return null;
    },
    getPropertyCaseInsensitive: function(obj, property) {
        property = property.toLowerCase();
        for (var key in obj) {
            if (obj.hasOwnProperty(key) && key.toLowerCase() == property) {
                return obj[key]; 
            }
        }
    } 
};
