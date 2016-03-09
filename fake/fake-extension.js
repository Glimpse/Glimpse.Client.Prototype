'use strict';

var _ = require('lodash');
var moment = require('moment');
var Chance = require('chance');

var chance = new Chance();
var mvcActions = [];
var allUsers = [];
var currentUsers = [];
var methods = [ 'GET', 'GET', 'GET', 'GET', 'POST', 'POST', 'POST', 'PUT', 'PUSH', 'DELETE' ];
var statuses = [ 200, 200, 200, 200, 200, 200, 404, 404, 403, 403, 500, 304 ];
var statusText = { 200: 'OK', 404: 'Not Found', 500: 'Server Error', 304: 'OK', 403: 'Error' };

chance.mixin({
    'integerRange': function(min, max) {
        return chance.integer({ min: min, max: max });
    },
    'durationRange': function(min, max) {
        return chance.floating({ min: min, max: max, fixed: 2 });
    },
    'dateRange': function(min, max) {
        var time = new Date().getTime();
        var difference = chance.integerRange(min, max);
        var newTime = new Date(time + difference);

        return newTime;
    },
    'mvcAction': function() {
        return _.clone(chance.pick(mvcActions), true); 
    },
    'mvcRequest': function(dateTime) {
        return generateMvcRequest(dateTime);
    },
    'mvcUser': function() {
        return _.clone(chance.pick(currentUsers), true);  
    },
    'httpPath': function() {
        return chance.pick(mvcActions).url;
    },
    'httpMethod': function() {
        return chance.pick(methods);
    },
    'httpStatus': function() {
        var code = chance.pick(statuses);
        return {
            code: code,
            text: statusText[code]
        };
    },
    'httpContentType': function() {
        // TODO: Switch over to weighted random with bias towards html
        return { type: 'text/html', category: { 'document': true } };
    }
});


var mapProperties = function(source, target, properties) {
    _.forEach(properties, function(property) { 
        target[property] = source[property];
    });
    
    return target;
};
var defaultOrEmpty = function(value) {
    return value === undefined || value === null ? '' : value;
}

// TODO: Should be brought into a different file/module 
var seedMvcActions = (function() {
    var generate = {
        common: {
            route: function (controller, action, id) {
                return {
                    name: 'Default',
                    pattern: '{controller=home}/{action=index}/{id?}',
                    data: [
                        { tag: 'controller', match: controller, default: 'home', required: false },
                        { tag: 'action', match: action, default: 'index', required: false },
                        { tag: 'id', match: id, default: null, required: false }
                    ]
                };
            }
        },
        instance: {
            childAction: {
                shoppingCart: function() {
                    return {
                        controller: 'ShoppingCart',
                        action: 'CartSummary',
                        route: generate.common.route('shoppingcart', 'cartsummary', null),
                        activities: [
                            { access: 'SQL', operation: 'Select', target: 'Carts', affected: 1, command: 'SELECT TOP (50) \n[Project1].[AlbumId] AS [AlbumId], \n[Project1].[GenreId] AS [GenreId], \n[Project1].[ArtistId] AS [ArtistId], \n[Project1].[Title] AS [Title], \n[Project1].[Price] AS [Price], \n[Project1].[AlbumArtUrl] AS [AlbumArtUrl]\nFROM ( SELECT \n    [Extent1].[AlbumId] AS [AlbumId], \n    [Extent1].[GenreId] AS [GenreId], \n    [Extent1].[ArtistId] AS [ArtistId], \n    [Extent1].[Title] AS [Title], \n    [Extent1].[Price] AS [Price], \n    [Extent1].[AlbumArtUrl] AS [AlbumArtUrl], \n    (SELECT \n        COUNT(1) AS [A1]\n        FROM [dbo].[OrderDetails] AS [Extent2]\n        WHERE [Extent1].[AlbumId] = [Extent2].[AlbumId]) AS [C1]\n    FROM [dbo].[Albums] AS [Extent1]\n)  AS [Project1]\nORDER BY [Project1].[C1] DESC'  }
                        ],
                        result: { name: 'CartSummary' },
                        trace: [
                            { message: 'Cart has items in that the user has added.' }
                        ]
                    };
                },
                genreMenu: function() {
                    return {
                        controller: 'Store',
                        action: 'GenreMenu',
                        route: generate.common.route('store', 'genremenu', null),
                        activities: [
                            { access: 'SQL', operation: 'Select', target: 'Genres', affected: 10, command: 'SELECT \n[Extent1].[GenreId] AS [GenreId], \n[Extent1].[Name] AS [Name], \n[Extent1].[Description] AS [Description]\nFROM [dbo].[Genres] AS [Extent1]' }
                        ],
                        result: { name: 'GenreMenu' }
                    };
                }
            },
            rootActions: {
                storeBrowse: function() {
                    var genre = chance.word();
                    
                    return {
                        path: '/Store/Browse',
                        query: '?Genre=' + genre,
                        controller: 'Store',
                        action: 'Browse',
                        route: generate.common.route('store', 'browse', null),
                        binding: [
                            { type: 'string', name: 'genre', value: genre }
                        ],
                        activities: [
                            { access: 'SQL', operation: 'Select', target: 'Albums', affected: chance.integerRange(2, 50), command: 'SELECT \n[Project1].[GenreId] AS [GenreId], \n[Project1].[Name] AS [Name], \n[Project1].[Description] AS [Description], \n[Project1].[C1] AS [C1], \n[Project1].[AlbumId] AS [AlbumId], \n[Project1].[GenreId1] AS [GenreId1], \n[Project1].[ArtistId] AS [ArtistId], \n[Project1].[Title] AS [Title], \n[Project1].[Price] AS [Price], \n[Project1].[AlbumArtUrl] AS [AlbumArtUrl]\nFROM ( SELECT \n    [Limit1].[GenreId] AS [GenreId], \n    [Limit1].[Name] AS [Name], \n    [Limit1].[Description] AS [Description], \n    [Extent2].[AlbumId] AS [AlbumId], \n    [Extent2].[GenreId] AS [GenreId1], \n    [Extent2].[ArtistId] AS [ArtistId], \n    [Extent2].[Title] AS [Title], \n    [Extent2].[Price] AS [Price], \n    [Extent2].[AlbumArtUrl] AS [AlbumArtUrl], \n    CASE WHEN ([Extent2].[AlbumId] IS NULL) THEN CAST(NULL AS int) ELSE 1 END AS [C1]\n    FROM  (SELECT TOP (2) [Extent1].[GenreId] AS [GenreId], [Extent1].[Name] AS [Name], [Extent1].[Description] AS [Description]\n        FROM [dbo].[Genres] AS [Extent1]\n        WHERE [Extent1].[Name] = "Rock" ) AS [Limit1]\n    LEFT OUTER JOIN [dbo].[Albums] AS [Extent2] ON [Limit1].[GenreId] = [Extent2].[GenreId]\n)  AS [Project1] ORDER BY [Project1].[GenreId] ASC, [Project1].[C1] ASC' }
                        ],
                        actions: [
                            generate.instance.childAction.shoppingCart(),
                            generate.instance.childAction.genreMenu()
                        ],
                        result: { name: 'Browse' },
                        trace: [
                            { template: { mask: 'Currently genre {0} selected', values: { '0': genre } } }
                        ]
                    };
                },
                storeDetail: function() { 
                    var id = chance.integerRange(1000, 2000);
            
                    return { 
                        path: '/Store/Details/' + id, 
                        controller: 'Store', 
                        action: 'Details',
                        route: generate.common.route('store', 'details', id),
                        binding: [
                            { type: 'int', name: 'id', value: id },
                            { type: 'bool', name: 'showAll', value: true }
                        ],
                        activities: [
                            { access: 'SQL', operation: 'Select', target: 'Albums', affected: 1, command: 'SELECT TOP (2) \n[Extent1].[AlbumId] AS [AlbumId], \n[Extent1].[GenreId] AS [GenreId], \n[Extent1].[ArtistId] AS [ArtistId], \n[Extent1].[Title] AS [Title], \n[Extent1].[Price] AS [Price], \n[Extent1].[AlbumArtUrl] AS [AlbumArtUrl]\nFROM [dbo].[Albums] AS [Extent1]\nWHERE [Extent1].[AlbumId] = 1 /* @p0 */' },
                            { access: 'SQL', operation: 'Select', target: 'Genres', affected: 1, command: 'SELECT \n[Extent1].[GenreId] AS [GenreId], \n[Extent1].[Name] AS [Name], \n[Extent1].[Description] AS [Description]\nFROM [dbo].[Genres] AS [Extent1]\nWHERE [Extent1].[GenreId] = 1 /* @EntityKeyValue1 */' },
                            { access: 'SQL', operation: 'Select', target: 'Artists', affected: 1, command: 'SELECT \n[Extent1].[ArtistId] AS [ArtistId], \n[Extent1].[Name] AS [Name]\nFROM [dbo].[Artists] AS [Extent1]\nWHERE [Extent1].[ArtistId] = 1 /* @EntityKeyValue1 */' }
                        ],
                        actions: [
                            generate.instance.childAction.shoppingCart(),
                            generate.instance.childAction.genreMenu()
                        ],
                        result: { name: 'Details' },
                        trace: [
                            { template: { mask: 'Currently item/detail {0} selected', values: { '0': id } } }
                        ]
                    };
                },
                home: function() {
                    return { 
                        path: '/', 
                        controller: 'Home', 
                        action: 'Index',
                        route: generate.common.route('home', 'index', null),
                        preActivities: [
                            { access: 'SQL', operation: 'Select', target: 'Albums', affected: 1, command: 'SELECT TOP (2) \n[Extent1].[AlbumId] AS [AlbumId], \n[Extent1].[GenreId] AS [GenreId], \n[Extent1].[ArtistId] AS [ArtistId], \n[Extent1].[Title] AS [Title], \n[Extent1].[Price] AS [Price], \n[Extent1].[AlbumArtUrl] AS [AlbumArtUrl]\nFROM [dbo].[Albums] AS [Extent1]\nWHERE [Extent1].[AlbumId] = 1 /* @p0 */' },
                            { access: 'mongo', type: 'data-mongodb-read', operation: 'toArray', query: {}, startTime: '2016-02-29T14:54:39.073 -0800', options: { find: 'MusicStore.AlbumCollection', limit: 0, skip: 0, query: {}, slaveOk: true, readPreference: { mode: 'primary' } }, connectionHost: 'localhost', connectionPort: 27017, database: 'MusicStore', collection: 'AlbumCollection' }
                        ],
                        activities: [
                            { access: 'SQL', operation: 'Select', target: 'Albums', affected: chance.integerRange(2, 50), command: 'SELECT TOP (5) \n[Project1].[AlbumId] AS [AlbumId], \n[Project1].[GenreId] AS [GenreId], \n[Project1].[ArtistId] AS [ArtistId], \n[Project1].[Title] AS [Title], \n[Project1].[Price] AS [Price], \n[Project1].[AlbumArtUrl] AS [AlbumArtUrl]\nFROM ( SELECT \n    [Extent1].[AlbumId] AS [AlbumId], \n    [Extent1].[GenreId] AS [GenreId], \n    [Extent1].[ArtistId] AS [ArtistId], \n    [Extent1].[Title] AS [Title], \n    [Extent1].[Price] AS [Price], \n    [Extent1].[AlbumArtUrl] AS [AlbumArtUrl], \n    (SELECT \n        COUNT(1) AS [A1]\n        FROM [dbo].[OrderDetails] AS [Extent2]\n        WHERE [Extent1].[AlbumId] = [Extent2].[AlbumId]) AS [C1]\n    FROM [dbo].[Albums] AS [Extent1]\n)  AS [Project1]\nORDER BY [Project1].[C1] DESC'  }
                        ],
                        postActivities: [
                            { access: 'SQL', operation: 'Select', target: 'Genres', affected: 1, command: 'SELECT \n[Extent1].[GenreId] AS [GenreId], \n[Extent1].[Name] AS [Name], \n[Extent1].[Description] AS [Description]\nFROM [dbo].[Genres] AS [Extent1]\nWHERE [Extent1].[GenreId] = 1 /* @EntityKeyValue1 */' }
                        ],
                        actions: [
                            generate.instance.childAction.shoppingCart(),
                            generate.instance.childAction.genreMenu()
                        ],
                        result: { name: 'Index' },
                        trace: [
                            { message: 'Initial page loaded.' }
                        ] 
                    };
                },
                cart: function() {
                    return { 
                        path: '/ShoppingCart/', 
                        controller: 'ShoppingCart', 
                        action: 'Index',
                        route: generate.common.route('shoppingcart', 'index', null),
                        binding: [
                            { type: 'UserCart', typeFullName: 'UserCart', name: 'cart', value: 'UserCart' }
                        ],
                        activities: [
                            { access: 'SQL', operation: 'Select', target: 'Carts', affected: 1, command: 'SELECT \n[Extent1].[RecordId] AS [RecordId], \n[Extent1].[CartId] AS [CartId], \n[Extent1].[AlbumId] AS [AlbumId], \n[Extent1].[Count] AS [Count], \n[Extent1].[DateCreated] AS [DateCreated]\nFROM [dbo].[Carts] AS [Extent1]\nWHERE [Extent1].[CartId] = "df0238d4-5bd4-49b5-97f0-9ba2c9957dc1" /* @p__linq__0 */' },
                            { access: 'SQL', operation: 'Select', target: 'Carts', affected: 1, command: 'SELECT \n[GroupBy1].[A1] AS [C1]\nFROM ( SELECT \n    SUM([Filter1].[A1]) AS [A1]\n    FROM ( SELECT \n         CAST( [Extent1].[Count] AS decimal(19,0)) * [Extent2].[Price] AS [A1]\n        FROM  [dbo].[Carts] AS [Extent1]\n        INNER JOIN [dbo].[Albums] AS [Extent2] ON [Extent1].[AlbumId] = [Extent2].[AlbumId]\n        WHERE [Extent1].[CartId] = "df0238d4-5bd4-49b5-97f0-9ba2c9957dc1" /* @p__linq__0 */\n    )  AS [Filter1]\n)  AS [GroupBy1]' },
                            { access: 'mongo', type: 'data-mongodb-read', operation: 'insertMany', docs: [ { a: '66703d9a-a2b6-475b-b42b-61349728cd98', b: '0', c: '1', _id: '56d5ec35b7ce8b4413938307' }, { a: '952b5a81-a1f0-49a5-9463-33344828d668', b: '1', c: '1', _id: '56d5ec35b7ce8b4413938308' } ], count: 2, insertedIds: ['56d5ec35b7ce8b4413938307', '56d5ec35b7ce8b4413938308' ], startTime: '2016-03-01T11:23:33.615 -0800', options: {}, connectionHost: 'localhost', connectionPort: 27017, database: 'MusicStore', collection: 'AlbumCollection' },
                            { access: 'mongo', type: 'data-mongodb-insert', operation: 'toArray', query: {}, startTime: '2016-02-29T14:54:39.073 -0800', options: { find: 'MusicStore.AlbumCollection', limit: 0, skip: 0, query: {}, slaveOk: true, readPreference: { mode: 'primary' } }, connectionHost: 'localhost', connectionPort: 27017, database: 'MusicStore', collection: 'AlbumCollection' }
                        ],
                        actions: [
                            generate.instance.childAction.shoppingCart(),
                            generate.instance.childAction.genreMenu()
                        ],
                        result: { name: 'Index' },
                        trace: [
                            { message: 'Cart applied tax rates correctly.' },
                            { template: { mask: 'Cart tax rates processed in {0}ms', values: { '0': chance.durationRange(0, 1) } } }
                        ] 
                    };
                },
                store: function() {
                    return { 
                        path: '/Store/', 
                        controller: 'Store', 
                        action: 'Index',
                        route: generate.common.route('store', 'index', null),
                        activities: [
                            { access: 'SQL', operation: 'Select', target: 'Genres', affected: 10, command: 'SELECT \n[Extent1].[GenreId] AS [GenreId], \n[Extent1].[Name] AS [Name], \n[Extent1].[Description] AS [Description]\nFROM [dbo].[Genres] AS [Extent1]' }
                        ],
                        actions: [
                            generate.instance.childAction.shoppingCart(),
                            generate.instance.childAction.genreMenu()
                        ],
                        result: { name: 'Index' },
                        trace: [
                            { message: 'Processing menu options for selection.' }
                        ] 
                    };
                },
                login: function() {
                    return { 
                        path: '/Account/LogIn/', 
                        controller: 'Account', 
                        action: 'LogIn',
                        route: generate.common.route('account', 'login', null),
                        actions: [
                            generate.instance.childAction.shoppingCart(),
                            generate.instance.childAction.genreMenu()
                        ],
                        result: { name: 'Login' },
                        trace: [
                            { template: { mask: 'User from {0} is attempting to login', values: { '0': chance.ip() } } }
                        ] 
                    };
                }
            }
        },
        meta: {
            stardardActions: [ 'home', 'cart', 'store', 'login' ]
        }
    }; 
    
    var executeSequence = function(store, instances, action) {
        for (var i = 0; i < instances; i++) {
            store.push(action());
        }
    };
     
    return function() {
        var actions = [];
        
        // go generate random actions weighting
        executeSequence(actions, chance.integerRange(5, 10), generate.instance.rootActions.storeBrowse);
        executeSequence(actions, chance.integerRange(10, 15), generate.instance.rootActions.storeDetail);
        executeSequence(actions, chance.integerRange(15, 20), function() {
                var targetName = generate.meta.stardardActions[chance.integerRange(0, generate.meta.stardardActions.length - 1)];
                return generate.instance.rootActions[targetName]();
            }); 
        
        return actions;
    };
})(); 

// TODO: Should be brought into a different file/module 
var seedUsers = function() {
    return [
        { userId: chance.guid(), username: 'Anthony', image: 'https://avatars.githubusercontent.com/u/585619' },
        { userId: chance.guid(), username: 'Nik', image: 'https://avatars.githubusercontent.com/u/199026' },
        { userId: chance.guid(), username: 'Christophe', image: 'https://avatars.githubusercontent.com/u/1467346' },
        { userId: chance.guid(), username: 'Bjorn', image: 'https://avatars.githubusercontent.com/u/1607579' },
        { userId: chance.guid(), username: 'Ian', image: 'https://avatars.githubusercontent.com/u/52329?' },
        { userId: chance.guid(), username: 'Keith', image: 'https://avatars.githubusercontent.com/u/133987?' },
        { userId: chance.guid(), username: 'Aaron', image: 'https://avatars.githubusercontent.com/u/434140?' },
        { userId: chance.guid(), username: 'Jeff', image: 'https://avatars.githubusercontent.com/u/683658?' },
        { userId: chance.guid(), username: 'Kristian', image: 'https://avatars.githubusercontent.com/u/582487?' },
        { userId: chance.guid(), username: 'James', image: 'https://avatars.githubusercontent.com/u/1197383?' }
    ];
};


// TODO: Should be brought into a different file/module
var generateMvcRequest = (function() {    
    // generate source
    var SourceGenerator = function() { 
    };
    SourceGenerator.prototype.processRequest = function(dateTime) { 
        var source = chance.mvcAction();
        
        // NOTE: now that we have cloned the this request source, need to go through 
        //       and setup the request for this instance 
        var serverLowerTime = chance.integerRange(5, 10);
        var serverUpperTime = chance.integerRange(60, 100);
        var httpStatus = chance.httpStatus();
        var contentType = chance.httpContentType();
        
        source.id = chance.guid();
        source.dateTime = dateTime || moment().utc().toISOString();
        source.networkTime = chance.integerRange(0, 15);
        source.serverTime = chance.integerRange(serverLowerTime, serverUpperTime); // TODO: Bug with these two lines
        source.actionDuration = chance.integerRange(serverLowerTime - 1, source.serverTime); // TODO: Need to verify that this works
        source.viewDuration = source.serverTime - source.actionDuration;
        source.clientTime = chance.integerRange(20, 120);
        source.queryTime = chance.integerRange(2, Math.max(source.actionDuration / 3, 3)); // TODO: derive from queries
        source.queryCount = chance.integerRange(1, 4); // TODO: derive from queries
        source.user = chance.mvcUser();
        source.method = chance.httpMethod();
        source.contentType = contentType.type;
        source.contentCategory = contentType.category;
        source.duration = source.clientTime + source.serverTime + source.networkTime;
        source.statusCode = httpStatus.code;   
        source.statusText = httpStatus.text;
        source.context = { type: 'Request', id: source.id };
        
        return source;  
    };
    
    // generate messages
    var MessageGenerator = function() {
        this.messages = [];
        this.counter = 0;
        this.stats = {
            queryDuration: 0,
            queryCount: 0
        };
    };
    MessageGenerator.support = {
        propName: function(prefix, prop) {
            return prefix ? prefix + prop : _.camelCase(prop);
        },
        beforeTimings: function(prefix, payload, startTime) {
            payload[this.propName(prefix, 'StartTime')] = startTime; 
        },
        afterTimings: function(prefix, payload, duration, startTime) {
            payload[this.propName(prefix, 'EndTime')] = null; //startTime + duration
            payload[this.propName(prefix, 'Duration')] = duration; 
            payload[this.propName(prefix, 'Offset')] = null; //offset; 
        },
        spotTimings: function(prefix, payload) {
            payload[this.propName(prefix, 'Time')] = null;  
            payload[this.propName(prefix, 'Offset')] = null; //offset; 
        },
        childTimings: function (events, availableTime) {
            // TODO: Need to calculate offsets
            var usedTime = 0;
    
            if (events) {
                var timeParts = availableTime / (events.length * 100 * 2.5);
                var upperParts = events.length * 100;
                var lowerParts = upperParts * 0.5;
    
                for (var i = 0; i < events.length; i++) {
                    var newActivityTime = timeParts * chance.integerRange(lowerParts, upperParts);
    
                    events[i].duration = newActivityTime;
    
                    usedTime += newActivityTime;
                }
            }
    
            return usedTime;
        }
    };
    MessageGenerator.prototype = { 
        createMessage: function(type, context) {
            return {
                types:  [ type ],
                context: context,
                id: chance.guid(),
                payload: {},
                ordinal: this.counter++
            };
        }, 
        createTab: function(context) {
            var message = this.createMessage('tab', context);
            message.payload =  {
                    name: 'Headers',
                    data: {
                        'Response': {
                            'Server': 'GitHub.com',
                            'Date': 'Mon, 02 Nov 2015 06:39:26 GMT',
                            'Content-Type': 'text/html; charset=utf-8',
                            'Transfer-Encoding': 'chunked',
                            'Status': '200 OK',
                            'Cache-Control': 'no-cache',
                            'Strict-Transport-Security': 'max-age=31536000; includeSubdomains; preload',
                            'Vary': 'Accept-Encoding',
                            'Content-Encoding': 'gzip'
                        },
                        'Request': {
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                            'Accept-Encoding': 'gzip, deflate, sdch',
                            'Accept-Language': 'en-US,en;q=0.8',
                            'Cache-Control': 'no-cache',
                            'Connection': 'keep-alive',
                            'Host': 'github.com',
                            'Pragma': 'no-cache'
                        }
                    }  
                };
            
            return message;
        },
        createUserIdentification: function(source) {
            var message = this.createMessage('user-identification', source.context);
            message.payload = source.user;
            
            return message;
        },
        createEnvironment: function(source) {
            var message = this.createMessage('environment', source.context);
            
            var payload = message.payload; 
            payload.serverName = 'DESKTOP-EH3D8UD';
            payload.serverTime = '2015-10-23T09:43:40.172';
            payload.serverTimezoneOffset = '-07:00';
            payload.serverDaylightSavingTime = true;

            return message;
        },
        createBeginRequest: function(source) {
            var message = this.createMessage('begin-request', source.context);
            
            var payload = message.payload; 
            payload.method = source.method;
            payload.url = 'http://localhost:5000' + source.path + defaultOrEmpty(source.query);
            payload.headers = {
                'Server': 'GitHub.com',
                'Date': 'Mon, 02 Nov 2015 06:39:26 GMT',
                'Content-Type': 'text/html; charset=utf-8',
                'Transfer-Encoding': 'chunked',
                'Status': '200 OK',
                'Cache-Control': 'no-cache',
                'Strict-Transport-Security': 'max-age=31536000; includeSubdomains; preload',
                'Vary': 'Accept-Encoding',
                'Content-Encoding': 'gzip'
            };

            MessageGenerator.support.beforeTimings('request', payload, source.dateTime);
            
            return message;
        },
        createEndRequest: function(source) {
            var message = this.createMessage('end-request', source.context);
            
            var payload = message.payload;
            payload.statusCode = source.statusCode;
            payload.statusText = source.statusText;
            payload.headers = {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, sdch',
                'Accept-Language': 'en-US,en;q=0.8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Content-Type': source.contentType,
                'Host': 'github.com',
                'Pragma': 'no-cache'
            };
            
            MessageGenerator.support.afterTimings('response', payload, source.duration, source.dateTime);
            
            return message;
        },
        createActionRoute: function(action, route, context) {
            var message = this.createMessage('action-route', context);
            
            var payload = message.payload;
            payload.actionId = action.actionId; 
            payload.routeName = route.name;
            payload.routePattern = route.pattern;
            payload.routeData = route.data; 
            //payload.routeConfiguration = null; // TODO: Not being used at the moment 
            
            // TODO: Bring in timing data when we have it
            //MessageGenerator.support.applyDuration('route', payload, chance.durationRange(0, 1), null, null); 
        
            return message;
        },
        createActionBinding: function(action, binding, context) {
            var message = this.createMessage('action-content', context);
            
            var payload = message.payload;
            payload.actionId = action.actionId;
            payload.binding = binding;
            
            // TODO: Bring in timing data when we have it
            //MessageGenerator.support.applyDuration('binding', payload, chance.durationRange(0, 1), null, null); // TODO: need to fix offset timings
            
            return message; 
        },
        createBeforeActionInvoked: function(action, context, isPrimary) {
            var message = this.createMessage('before-action-invoked', context);
            
            var payload = message.payload; 
            payload.actionId = action.actionId;
            payload.actionDisplayName = 'Glimpse.AgentServer.Mvc.Sample.Controllers.' + action.controller + 'Controller.' + action.action;
            payload.actionName = action.action; 
            payload.actionControllerName = action.controller;
            payload.actionTargetClass = action.controller + 'Controller';
            payload.actionTargetMethod = action.action;
            //payload.actionPhysicalFile = 'Controller/' + action.controller + 'Controller.cs'; // Not used currently
            
            // TODO: Bring in timing data when we have it
            //MessageGenerator.support.beforeTimings('actionInvoked', payload, null);
            
            return message; 
        },
        createAfterActionInvoked: function(action, context) {
            var message = this.createMessage('after-action-invoked', context);
            
            var payload = message.payload; 
            payload.actionId = action.actionId;
            payload.actionName = action.action; 
            payload.actionControllerName = action.controller;
            
            // TODO: Bring in timing data when we have it
            MessageGenerator.support.afterTimings('actionInvoked', payload, action.actionDuration || action.duration, null);
            
            return message; 
        }, 
        createActionViewFound: function(action, result, context) {
            var message = this.createMessage('action-view-found', context);
            
            var payload = message.payload;
            payload.actionId = action.actionId;
            payload.actionName = action.action; 
            payload.actionControllerName = action.controller;
            payload.viewName = result.name;
            payload.viewPath = 'View/' + action.controller + '/' + action.action + '.cshtml';
            payload.viewDidFind = true;
            
            // TODO: Bring in timing data when we have it
            //MessageGenerator.support.spotTimings('viewSearched', payload, null);
            
            return message; 
        },
        createBeforeActionViewInvoked: function(action, result, context) {
            var message = this.createMessage('before-action-view-invoked', context);
            
            var payload = message.payload;
            payload.actionId = action.actionId;
            payload.actionName = action.action; 
            payload.actionControllerName = action.controller;
            payload.viewPath = 'View/' + action.controller + '/' + action.action + '.cshtml';
            payload.viewData = { tempData: {}, viewData: {} };
            //payload.viewProvider = 'Razor'; 
            
            // TODO: Bring in timing data when we have it
            //MessageGenerator.support.beforeTimings('view', payload, null);
            
            return message; 
        }, 
        createAfterActionViewInvoked: function(action, result, context) {
            var message = this.createMessage('after-action-view-invoked', context);
            
            var payload = message.payload;
            payload.actionId = action.actionId;
            payload.actionName = action.action; 
            payload.actionControllerName = action.controller;
            
            // TODO: Bring in timing data when we have it
            MessageGenerator.support.afterTimings('view', payload, action.viewDuration || result.duration, null);
            
            return message; 
        },
        createBeforeExecuteCommand: function(action, query, context) {
            var message = this.createMessage('before-execute-command', context);
            
            var payload = message.payload;
            payload.commandMethod = 'ExecuteReader';
            payload.commandIsAsync = true;
            payload.commandText = query.command;
            payload.commandType = 'Text';
            //payload.commandParameters = null;
            
            // TODO: Bring in timing data when we have it
            //MessageGenerator.support.beforeTimings('command', payload, null);
            
            this.stats.queryCount++;
            this.stats.queryDuration += query.duration;
            
            return message; 
        },
        createAfterExecuteCommand: function(action, query, context) {
            var message = this.createMessage('after-execute-command', context);
            
            var payload = message.payload;
            payload.commandHadException = false;
            //payload.commandException = null;
            
            // TODO: Bring in timing data when we have it
            MessageGenerator.support.afterTimings('command', payload, (parseInt(query.duration * 100)) / 100, null);
            
            return message;
        },
        createMonogoCommand: function(action, query, context) {
            var message = this.createMessage(query.type, context);
            
            message.payload = query;
            
            MessageGenerator.support.afterTimings('', query, (parseInt(query.duration * 100)) / 100, null);
            
            return message;
        },
        createBeforeViewComponent: function(action, context) {
            var message = this.createMessage('before-view-component', context);
            
            var payload = message.payload; 
            payload.componentId = action.actionId;
            payload.componentDisplayName = 'Glimpse.AgentServer.Mvc.Sample.Components.' + action.action;
            payload.componentName = action.action; 
            
            // TODO: Bring in timing data when we have it
            //MessageGenerator.support.beforeTimings('actionInvoked', payload, null);
            
            return message; 
        },
        createAfterViewComponent: function(action, context) {
            var message = this.createMessage('after-view-component', context);
            
            var payload = message.payload; 
            payload.componentId = action.actionId;
            payload.componentName = action.action; 
            
            // TODO: Bring in timing data when we have it 
            MessageGenerator.support.afterTimings('component', payload, (parseInt(action.duration * 100)) / 100, null);
            
            return message; 
        }, 
        createBrowserNavigationTiming: function(source) {
            var message = this.createMessage('browser-navigation-timing', source.context);
            
            var payload = message.payload;
            payload.navigationStart = 1445665751561;
            payload.unloadEventStart = 1445665762764;
            payload.unloadEventEnd = 1445665762764;
            payload.redirectStart = 0;
            payload.redirectEnd = 0;
            payload.fetchStart = 1445665751561;
            payload.domainLookupStart = 1445665751568;
            payload.domainLookupEnd = 1445665751568;
            payload.connectStart = 1445665751568;
            payload.connectEnd = 1445665751570;
            payload.secureConnectionStart = 0;
            payload.requestStart = 1445665751570;
            payload.responseStart = 1445665762753;
            payload.responseEnd = 1445665762852;
            payload.domLoading = 1445665762786;
            payload.domInteractive = 1445665763972;
            payload.domContentLoadedEventStart = 1445665763972;
            payload.domContentLoadedEventEnd = 1445665763983;
            payload.domComplete = 1445665764285;
            payload.loadEventStart = 1445665764285;
            payload.loadEventEnd = 1445665764306;
            payload.firstPaintTime = 12427.310791015625;
            payload.firstPaint = 1445665763989.0898;
            payload.loadTime = 12745;
            payload.domReadyTime = 313;
            payload.readyStart = 0;
            payload.redirectTime = 0;
            payload.appcacheTime = 7;
            payload.unloadEventTime = 0;
            payload.lookupDomainTime = 0;
            payload.connectTime = 2;
            payload.requestTime = 11282;
            payload.initDomTreeTime = 1120;
            payload.loadEventTime = 21;
            payload.networkRequestTime = 9;
            payload.networkResponseTime = 99;
            payload.networkTime = chance.integerRange(1, 5);
            payload.serverTime = source.duration;
            payload.browserTime = chance.integerRange(20, 120);
            
            return message;
        },
        // createLog: function(log, context) { 
        //     var message = this.createMessage('request-framework-log', context);
        //     mapProperties(log, message.payload, [ 'template', 'message' ]);
        //     
        //     MessageGenerator.support.applyTiming('log', message.payload,  null, null); // TODO: need to fix offset timings
        //     
        //     return message;
        // },
        // createFilter: function(action, targetMethod, filterType, category, origin, context) {
        //     var message = this.createMessage('request-framework-filter', context);
        //     
        //     var payload = message.payload;  
        //     payload.targetClass = action.targetClass + 'Controller';
        //     payload.targetMethod = targetMethod;
        //     payload.filterType = filterType;
        //     payload.category = category;
        //     payload.filterOrigin = origin || 'system';
        //     payload.controller = action.controller;
        //     payload.action = action.action; 
        //     
        //     MessageGenerator.support.applyDuration('filter', payload, chance.durationRange(0, 1), null, null); // TODO: need to fix offset timings
        //     
        //     return message;
        // },
        modifyInstance: function(action) {
            var availableTime = action.duration;
            availableTime -= MessageGenerator.support.childTimings(action.actions, availableTime, 2.5);
            availableTime -= MessageGenerator.support.childTimings(action.activities, availableTime, 1.5);  
            
            action.actionId = chance.guid();
        },
        processActivities: function(activities, action, context) {
            if (activities) {
                _.forEach(activities, function(activity) {
                    if (activity.access == 'SQL') {
                        this.messages.push(this.createBeforeExecuteCommand(action, activity, context));
                        this.messages.push(this.createAfterExecuteCommand(action, activity, context));
                    } 
                    else if (activity.access == 'mongo') {
                        this.messages.push(this.createMonogoCommand(action, activity, context));
                    }
                }, this);
            }
        },
        processChildActions: function(action, request, context) {
            this.modifyInstance(action);
                
            this.messages.push(this.createBeforeViewComponent(action, context));
            this.processActivities(action.activities, action, context);
            this.messages.push(this.createAfterViewComponent(action, context));
        },
        processAction: function(action, request, context) {
            this.modifyInstance(action);
                
            // route
            this.messages.push(this.createActionRoute(action, action.route, context));
            
            // filter
            // this.messages.push(this.createFilter(action, 'OnAuthorization', 'Authorization', 'Authorization', null, context));
            // this.messages.push(this.createLog({ template: { mask: 'User {0} authorized to execute this action', values: { '0': request.user.name } } }, context));
            // this.messages.push(this.createFilter(action, 'OnActionExecuting', 'Action', 'Executing', null, context));
            
            // action
            if (action.binding) {
                this.messages.push(this.createActionBinding(action, action.binding, context));
            }
            this.messages.push(this.createBeforeActionInvoked(action, context, action == request));
            this.processActivities(action.activities, action, context);
            // if (action.trace) {
            //     _.forEach(action.trace, function(log) {
            //         this.messages.push(this.createLog(log, context));
            //     }, this);
            // }
            this.messages.push(this.createAfterActionInvoked(action, context));
            
            // filter
            // this.messages.push(this.createFilter(action, 'OnActionExecuted', 'Action', 'Executed', null, context));
            // this.messages.push(this.createFilter(action, 'OnResultExecuting', 'Result', 'Executing', null, context));
            
            // result
            this.messages.push(this.createActionViewFound(action, action.result, context));
            this.messages.push(this.createBeforeActionViewInvoked(action, action.result, context));
            
            // child actions
            if (action.actions) {
                _.forEach(action.actions, function(childAction) {
                    this.processChildActions(childAction, request, context);
                }, this);
            }
            
            // fitler
            // this.messages.push(this.createFilter(action, 'OnResultExecuted', 'Result', 'Executed', null, context));
            
            this.messages.push(this.createAfterActionViewInvoked(action, action.result, context));
        },
        processRequest: function(source) {
            this.messages.push(this.createBeginRequest(source));
            
            this.processActivities(source.preActivities, source, source.context);
            
            this.messages.push(this.createUserIdentification(source));
            this.messages.push(this.createEnvironment(source));
            this.messages.push(this.createTab(source.context))
            
            this.processAction(source, source, source.context);
            
            this.processActivities(source.postActivities, source, source.context);
            
            this.messages.push(this.createEndRequest(source)); 
            this.messages.push(this.createBrowserNavigationTiming(source))
            
            return this.messages;
        },
        modifySource: function(source) {
            source.queryTime = this.stats.queryDuration;
            source.queryCount = this.stats.queryCount;
        }
    };
    
    // generate request
    var RequestGenerator = function() { 
    };
    RequestGenerator.prototype.processRequest = function(source) {
        var request = {};
        request.id = source.id;
        request.messages = _.indexBy(source.messages, 'id');
        request.types = {};
        request.tabs = { 'tab.messages': { title: 'Messages', payload: source.messages } };
        
        _.forEach(request.messages, function(message) {
            _.forEach(message.types, function(type) {
                if (!request.types[type]) {
                    request.types[type] = [];
                    
                    var payload = message.payload;
                    if (type == 'begin-request') {
                        payload.path = source.path;
                        payload.query = source.query;
                        
                        request._requestStartTime = payload.requestStartTime;
                        request._requestMethod = payload.method;
                        request._requestUrl = (payload.path || '') + (payload.query || '');
                    }
                    if (type == 'end-request') {
                        request._responseStatusCode = payload.statusCode; 
                        request._responseStatusText = source.statusText;
                        request._responseContentCategory = source.contentCategory;  
                        
                        payload.statusText = request._responseStatusText;  
                        payload.contentCategory = request._responseContentCategory;
                    }
                }
                
                request.types[type].push(message.id);
            });
        });
        
        return request;
    };
    
    return function(dateTime) {
        var sourceGenerator = new SourceGenerator();
        var source = sourceGenerator.processRequest(dateTime);
        
        var messageGenerator = new MessageGenerator();
        var messages = messageGenerator.processRequest(source);
        
        source.messages = messages; 
         
        var requestGenerator = new RequestGenerator();
        var request = requestGenerator.processRequest(source);
        source.request = request;
        
        return source;
    };
})();


// TODO: when aboves are shifted this setting should be changed
mvcActions = seedMvcActions();
allUsers = seedUsers();
currentUsers = chance.pick(allUsers, chance.integerRange(3, allUsers.length));

module.exports = chance;
