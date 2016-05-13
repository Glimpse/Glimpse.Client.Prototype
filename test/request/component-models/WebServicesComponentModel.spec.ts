'use strict';

import { IWebServicesRequest } from '../../../src/request/component-models/IWebServicesComponentModel';
import { WebServicesComponentModel, WebServicesRequest } from '../../../src/request/component-models/WebServicesComponentModel';
import { MockGlimpse } from '../../mocks/MockGlimpse';
import { MockRequestDetailStore } from '../mocks/MockRequestDetailStore';

import * as _ from 'lodash';
import * as chai from 'chai';

const should = chai.should();

describe('WebServicesComponentModel', () => {
    const createMessage = (ordinal) => {
        return {
            ordinal: ordinal,
            payload: { }
        };
    };

    describe('#init', () => {
        it('should create a default component with no messages', () => {
            const mockGlimpse = new MockGlimpse();
            const mockStore = new MockRequestDetailStore();
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return null;
                }
            };

            const componentModel = new WebServicesComponentModel(mockGlimpse, mockStore, mockMessageProcessor);
            const mockRequest = {};

            componentModel.init(mockRequest);

            should.not.exist(componentModel.messages);
            should.not.exist(componentModel.requestMessages);
            should.not.exist(componentModel.responseMessages);
            should.not.exist(componentModel.selectedMessage);
        });

        it('should automatically select the first record and make avilable other messages', () => {
            const dataHttpRequest = [];
            const dataHttpResponse = [];

            for (let i = 0; i < 2; i++) {
                dataHttpRequest.push(createMessage(dataHttpRequest.length + 1));
                dataHttpResponse.push(createMessage(dataHttpResponse.length + 1));
            }

            const mockGlimpse = new MockGlimpse();
            const mockStore = new MockRequestDetailStore();
            const mockMessageProcessor = {
                getTypeMessageList: 'list',
                getTypeStucture: (request, options) => {
                    return {
                        dataHttpRequest: dataHttpRequest,
                        dataHttpResponse: dataHttpResponse
                    };
                }
            };

            const componentModel = new WebServicesComponentModel(mockGlimpse, mockStore, mockMessageProcessor);
            const mockRequest = {};

            componentModel.init(mockRequest);

            // basic state is correct
            componentModel.requestMessages.length.should.equal(2);
            componentModel.responseMessages.length.should.equal(2);
            componentModel.messages.length.should.equal(2);
            should.exist(componentModel.selectedMessage);
            
            // default selected message is correct
            var selectedMessage = componentModel.selectedMessage;
            componentModel.requestMessages[0].should.equal(selectedMessage.requestMessage);
            componentModel.responseMessages[0].should.equal(selectedMessage.responseMessage);
            selectedMessage.ordinal.should.equal(1);
            
            // check that the messages list matches what we expect
            componentModel.requestMessages[0].should.equal(componentModel.messages[0].requestMessage);
            componentModel.responseMessages[0].should.equal(componentModel.messages[0].responseMessage);
            componentModel.requestMessages[1].should.equal(componentModel.messages[1].requestMessage);
            componentModel.responseMessages[1].should.equal(componentModel.messages[1].responseMessage);
        });
    });
});
