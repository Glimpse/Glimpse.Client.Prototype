'use strict';

import { ComponentModel } from '../../../src/request/component-models/ComponentModel';

import * as chai from 'chai';

const should = chai.should();

describe('ComponentModel', () => {

    class MockComponentModel extends ComponentModel<{}> {
        public init(request) {
            // No-op.
        }

        public fireUpdate() {
            this.emitUpdate();
        }
    }

    describe('#createState', () => {
        it('should return the old state', () => {
            const mockComponentModel = new MockComponentModel();

            let state = mockComponentModel.createState();

            should.not.exist(state);

            const oldState = {};

            state = mockComponentModel.createState(oldState);

            should.exist(state);

            state.should.equal(oldState);
        });
    });

    describe('#onUpdate', () => {
        it('should subscribe to updates', () => {
            const mockComponentModel = new MockComponentModel();

            let callback1Count = 0;
            let callback2Count = 0;

            const callback1 = model => {
                callback1Count++;
            };

            const callback2 = model => {
                callback2Count++;
            };

            mockComponentModel.onUpdate(callback1);

            mockComponentModel.fireUpdate();

            callback1Count.should.equal(1);

            mockComponentModel.onUpdate(callback2);

            mockComponentModel.fireUpdate();

            callback1Count.should.equal(2);
            callback2Count.should.equal(1);

            mockComponentModel.removeUpdateListener(callback1);

            mockComponentModel.fireUpdate();

            callback1Count.should.equal(2);
            callback2Count.should.equal(2);

            mockComponentModel.removeUpdateListener(callback2);

            mockComponentModel.fireUpdate();

            callback2Count.should.equal(2);
        });
    });
});
