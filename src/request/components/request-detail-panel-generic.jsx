'use strict';

var React = require('react');
var glimpse = require('glimpse');

function process(data) {
    if (glimpse.util.isArray(data)) {
        return processArray(data);
    }
    else if (glimpse.util.isObject(data)) {
        return processObject(data);
    }
    else if (data === null || data === undefined) {
        return '--';
    }
    else if (data === true || data === false) {
        return data ? 'true' : 'false';
    }
    else {
        return data;
    }
}

function processArray(data) {
    if (data.length > 0) {
        var header = [];
        for (var key in data[0]) {
            header.push(<th key={key}>{key}</th>);
        }

        var body = data.map(function (item) {
            var row = [];
            for (var key in item) {
                row.push(<td key={key}>{process(item[key])}</td>);
            }

            return <tr>{row}</tr>;
        });

        return <table><thead>{header}</thead><tbody>{body}</tbody></table>;
    }
}

function processObject(item) {
    var body = [];
    for (var key in item) {
        body.push(<tr key={key}><th>{key}</th><td>{process(item[key])}</td></tr>);
    }

    return <table><thead><th>Key</th><th>Value</th></thead><tbody>{body}</tbody></table>;
}

module.exports = React.createClass({
    render: function () {
        var payload = this.props.payload || this.props.data.payload;
        var result = null;

        if (payload) {
            result = process(payload);
        }

        return result || <div>No records found.</div>;
    }
});
