'use strict';

var glimpse = require('glimpse');
var React = require('react');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var UserItem = require('./request-user-list-item-view');

module.exports = React.createClass({
    render: function () {
        var allUsers = this.props.allUsers;                

/*
                <ReactCSSTransitionGroup component="div" transitionName="request-user-group-item" transitionLeave={false}>
                    {allUsers.map(function(user) {
                        return <UserItem key={user.details.userId} user={user} />;
                    })}
                </ReactCSSTransitionGroup>
*/

        return (
            <div className="request-user-group">
                {allUsers.map(function(user) {
                    return <UserItem key={user.details.userId} user={user} />;
                })}
                {glimpse.util.isEmpty(allUsers) ? <em>No found users.</em> : null}
            </div>
        );
    }
});
