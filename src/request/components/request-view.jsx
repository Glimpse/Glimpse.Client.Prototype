require('./request-view.scss');

var React = require('react');
var User = require('./request-user-view');
var Filter = require('./request-filter-view');
var Summary = require('./request-summary-view');
var Detail = require('./request-detail-view');

module.exports = React.createClass({
    render: function () {
        return (
            <div className="request-holder application-section-group">
                <div className="request-user-section application-section">
                    <div className="request-holder-content">
                        <User />
                    </div>
                </div>
                <div className="request-summary-section application-section">
                    <div className="request-holder-content">
                        <Summary />
                    </div>
                </div>
                <div className="request-filter-section application-section">
                    <div className="request-holder-content">
                        <Filter />
                    </div>
                </div>
                <Detail />
            </div> 
        );
    }
});


// TODO: Need to come up with a better self registration process
(function () {
    var shellController = require('shell/shell');

    shellController.registerApplication({
        key: 'core_request',
        component: module.exports
    });
})();
