'use strict';

import { ILoggingComponentState, ILoggingLevelModel } from '../../../src/request/component-models/ILoggingComponentModel';
import { LoggingComponentModel } from '../../../src/request/component-models/LoggingComponentModel';

import * as _ from 'lodash';
import * as chai from 'chai';

const should = chai.should();

describe('LoggingComponentModel', () => {
    const createMessage = (ordinal, level) => {
        return {
            ordinal: ordinal,
            payload: {
                level: level
            }
        };
    };

    describe('#init', () => {
        it('should create a default set of levels with no messages', () => {
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            const componentModel = new LoggingComponentModel(mockMessageProcessor);
            const mockRequest = {};

            componentModel.init(mockRequest);

            componentModel.totalMessageCount.should.equal(0);

            const levels = componentModel.levels;

            should.exist(levels);

            levels.length.should.equal(6);

            levels.forEach(level => {
                level.messageCount.should.equal(0);
            });

            levels[0].level.should.equal('Critical');
            levels[1].level.should.equal('Error');
            levels[2].level.should.equal('Warning');
            levels[3].level.should.equal('Information');
            levels[4].level.should.equal('Verbose');
            levels[5].level.should.equal('Debug');
        });

        it('should create a level for each message level in request', () => {
            const messages = [];

            for (let i = 0; i < 2; i++) {
                messages.push(createMessage(messages.length + 1, 'Critical'));
                messages.push(createMessage(messages.length + 1, 'Error'));
                messages.push(createMessage(messages.length + 1, 'Warning'));
                messages.push(createMessage(messages.length + 1, 'Information'));
                messages.push(createMessage(messages.length + 1, 'Verbose'));
                messages.push(createMessage(messages.length + 1, 'Debug'));
            }

            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {
                        logWrite: messages
                    };
                }
            };

            const componentModel = new LoggingComponentModel(mockMessageProcessor);
            const mockRequest = {};

            componentModel.init(mockRequest);

            componentModel.totalMessageCount.should.equal(12);

            const levels = componentModel.levels;

            should.exist(levels);

            levels.length.should.equal(6);

            levels.forEach(level => {
                level.messageCount.should.equal(2);
            });
        });

        it('should create a level for each message level in request and defaults for others', () => {
            const messages = [];

            messages.push(createMessage(messages.length + 1, 'Critical'));

            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {
                        logWrite: messages
                    };
                }
            };

            const componentModel = new LoggingComponentModel(mockMessageProcessor);
            const mockRequest = {};

            componentModel.init(mockRequest);

            componentModel.totalMessageCount.should.equal(1);

            const levels = componentModel.levels;

            should.exist(levels);

            levels.length.should.equal(6);

            levels.forEach(level => {
                if (level.level === 'Critical') {
                    level.messageCount.should.equal(1);
                }
                else {
                    level.messageCount.should.equal(0);
                }
            });
        });
    });

    describe('#getMessages', () => {
        it('should return all messages with no filter state', () => {
            const messages = [];

            for (let i = 0; i < 2; i++) {
                messages.push(createMessage(messages.length + 1, 'Critical'));
                messages.push(createMessage(messages.length + 1, 'Error'));
                messages.push(createMessage(messages.length + 1, 'Warning'));
                messages.push(createMessage(messages.length + 1, 'Information'));
                messages.push(createMessage(messages.length + 1, 'Verbose'));
                messages.push(createMessage(messages.length + 1, 'Debug'));
            }

            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {
                        logWrite: messages
                    };
                }
            };

            const componentModel = new LoggingComponentModel(mockMessageProcessor);
            const mockRequest = {};

            componentModel.init(mockRequest);

            const filteredMessages = componentModel.getMessages(/* state: */ undefined);

            should.exist(filteredMessages);

            filteredMessages.length.should.equal(12);

            for (let i = 0; i < 12; i++) {
                filteredMessages[i].ordinal.should.equal(i + 1);
            }
        });

        it('should return all messages with an empty filter state', () => {
            const messages = [];

            for (let i = 0; i < 2; i++) {
                messages.push(createMessage(messages.length + 1, 'Critical'));
                messages.push(createMessage(messages.length + 1, 'Error'));
                messages.push(createMessage(messages.length + 1, 'Warning'));
                messages.push(createMessage(messages.length + 1, 'Information'));
                messages.push(createMessage(messages.length + 1, 'Verbose'));
                messages.push(createMessage(messages.length + 1, 'Debug'));
            }

            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {
                        logWrite: messages
                    };
                }
            };

            const componentModel = new LoggingComponentModel(mockMessageProcessor);
            const mockRequest = {};

            componentModel.init(mockRequest);

            const filteredMessages = componentModel.getMessages({});

            should.exist(filteredMessages);

            filteredMessages.length.should.equal(12);

            for (let i = 0; i < 12; i++) {
                filteredMessages[i].ordinal.should.equal(i + 1);
            }
        });

        it('should return all messages when all filters selected', () => {
            const messages = [];

            for (let i = 0; i < 2; i++) {
                messages.push(createMessage(messages.length + 1, 'Critical'));
                messages.push(createMessage(messages.length + 1, 'Error'));
                messages.push(createMessage(messages.length + 1, 'Warning'));
                messages.push(createMessage(messages.length + 1, 'Information'));
                messages.push(createMessage(messages.length + 1, 'Verbose'));
                messages.push(createMessage(messages.length + 1, 'Debug'));
            }

            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {
                        logWrite: messages
                    };
                }
            };

            const componentModel = new LoggingComponentModel(mockMessageProcessor);
            const mockRequest = {};

            componentModel.init(mockRequest);

            const filteredMessages = componentModel.getMessages({
                Critical: true,
                Error: true,
                Warning: true,
                Information: true,
                Verbose: true,
                Debug: true
            });

            should.exist(filteredMessages);

            filteredMessages.length.should.equal(12);

            for (let i = 0; i < 12; i++) {
                filteredMessages[i].ordinal.should.equal(i + 1);
            }
        });

        it('should return only messages of selected levels', () => {
            const messages = [];

            for (let i = 0; i < 2; i++) {
                messages.push(createMessage(messages.length + 1, 'Critical'));
                messages.push(createMessage(messages.length + 1, 'Error'));
                messages.push(createMessage(messages.length + 1, 'Warning'));
                messages.push(createMessage(messages.length + 1, 'Information'));
                messages.push(createMessage(messages.length + 1, 'Verbose'));
                messages.push(createMessage(messages.length + 1, 'Debug'));
            }

            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {
                        logWrite: messages
                    };
                }
            };

            const componentModel = new LoggingComponentModel(mockMessageProcessor);
            const mockRequest = {};

            componentModel.init(mockRequest);

            const filteredMessages = componentModel.getMessages({
                Critical: false,
                Error: true,
                Warning: false,
                Information: false,
                Verbose: true,
                Debug: false
            });

            should.exist(filteredMessages);

            filteredMessages.length.should.equal(4);

            filteredMessages[0].ordinal.should.equal(2);
            filteredMessages[1].ordinal.should.equal(5);
            filteredMessages[2].ordinal.should.equal(8);
            filteredMessages[3].ordinal.should.equal(11);
        });
    });

    describe('#isShown', () => {
        it('should return true if there is no state', () => {
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            const componentModel = new LoggingComponentModel(mockMessageProcessor);

            const state: ILoggingComponentState = {};
            const mockLevel: ILoggingLevelModel = {
               level: 'Critical',
               messageCount: 0
            };

            componentModel.isShown(state, mockLevel).should.equal(true);
        });

        it('should return true if there the state is true', () => {
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            const componentModel = new LoggingComponentModel(mockMessageProcessor);

            const state: ILoggingComponentState = {
                'Critical': true
            };
            const mockLevel: ILoggingLevelModel = {
               level: 'Critical',
               messageCount: 0
            };

            componentModel.isShown(state, mockLevel).should.equal(true);
        });

        it('should return false if there the state is false', () => {
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            const componentModel = new LoggingComponentModel(mockMessageProcessor);

            const state: ILoggingComponentState = {
                'Critical': false
            };
            const mockLevel: ILoggingLevelModel = {
               level: 'Critical',
               messageCount: 0
            };

            componentModel.isShown(state, mockLevel).should.equal(false);
        });
    });

    describe('#toggleLevel', () => {
        it('should toggle a default value to false', () => {
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            let wasCalled = false;

            const callback = model => {
                wasCalled = true;
            };

            const componentModel = new LoggingComponentModel(mockMessageProcessor);

            componentModel.onUpdate(callback);

            const state: ILoggingComponentState = {};
            const mockLevel: ILoggingLevelModel = {
               level: 'Critical',
               messageCount: 0
            };

            componentModel.toggleLevel(state, mockLevel);

            state.should.have.property('Critical').equal(false);

            wasCalled.should.equal(true);
        });

        it('should toggle a true value to false', () => {
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            let wasCalled = false;

            const callback = model => {
                wasCalled = true;
            };

            const componentModel = new LoggingComponentModel(mockMessageProcessor);

            componentModel.onUpdate(callback);

            const state: ILoggingComponentState = {
                'Critical': true
            };
            const mockLevel: ILoggingLevelModel = {
               level: 'Critical',
               messageCount: 0
            };

            componentModel.toggleLevel(state, mockLevel);

            state.should.have.property('Critical').equal(false);

            wasCalled.should.equal(true);
        });

        it('should toggle a false value to true', () => {
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            let wasCalled = false;

            const callback = model => {
                wasCalled = true;
            };

            const componentModel = new LoggingComponentModel(mockMessageProcessor);

            componentModel.onUpdate(callback);

            const state: ILoggingComponentState = {
                'Critical': false
            };
            const mockLevel: ILoggingLevelModel = {
               level: 'Critical',
               messageCount: 0
            };

            componentModel.toggleLevel(state, mockLevel);

            state.should.have.property('Critical').equal(true);

            wasCalled.should.equal(true);
        });
    });

    describe('#toggleAll', () => {
        it('should do nothing if given an empty state', () => {
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            let wasCalled = false;

            const callback = model => {
                wasCalled = true;
            };

            const componentModel = new LoggingComponentModel(mockMessageProcessor);

            componentModel.onUpdate(callback);

            const state: ILoggingComponentState = {};

            componentModel.toggleAll(state);

            _.isEmpty(state).should.equal(true);

            wasCalled.should.equal(false);
        });

        it('should do nothing if given an all-selected state', () => {
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            let wasCalled = false;

            const callback = model => {
                wasCalled = true;
            };

            const componentModel = new LoggingComponentModel(mockMessageProcessor);

            componentModel.onUpdate(callback);

            const state: ILoggingComponentState = {
                'Critical': true
            };

            componentModel.toggleAll(state);

            _.all(state, shown => shown).should.equal(true);

            wasCalled.should.equal(false);
        });

        it('should toggle un-selected state', () => {
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {};
                }
            };

            let wasCalled = false;

            const callback = model => {
                wasCalled = true;
            };

            const componentModel = new LoggingComponentModel(mockMessageProcessor);

            componentModel.onUpdate(callback);

            const state: ILoggingComponentState = {
                'Critical': true,
                'Error': false
            };

            componentModel.toggleAll(state);

            _.all(state, shown => shown).should.equal(true);

            wasCalled.should.equal(true);
        });
    });
});
