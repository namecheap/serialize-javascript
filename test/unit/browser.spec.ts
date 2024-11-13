import sinon from 'sinon';
import { expect } from 'chai';
import * as generateUUIDModule from '../../src/generateUUID';
import * as placeholderSerializerModule from '../../src/Serializer/PlaceholderSerializer';

describe('Browser entrypoint', () => {
    let serializeStub: sinon.SinonStub;
    let generateUUIDStub: sinon.SinonStub;
    let placeholderSerializerSpy: sinon.SinonSpy;
    let serializeFn;
    let cryptoMock = {};

    before(() => {
        // Mock the `window` and `window.crypto` if they are not defined
        if (typeof global.window === 'undefined') {
            (global as any).window = {};
        }

        Object.defineProperty(global.window, 'crypto', {
            value: cryptoMock,
            configurable: true,
            writable: true,
        });

        generateUUIDStub = sinon.stub(generateUUIDModule, 'generateUUID');
        generateUUIDStub.returns('00000000000000000000000000000');

        placeholderSerializerSpy = sinon.spy(placeholderSerializerModule, 'PlaceholderSerializer');

        serializeStub = sinon.stub(placeholderSerializerModule.PlaceholderSerializer.prototype, 'serialize').returns('serialized-data');

        const { serialize } = require('../../src/browser');
        serializeFn = serialize;
    });

    after(() => {
        Object.defineProperty(global.window, 'crypto', {
            value: undefined,
            configurable: true,
            writable: true,
        });

        sinon.restore();
    });

    it('should invoke genereUUID function with window.crypto', () => {
        expect(generateUUIDStub.calledOnce).to.be.true;
        expect(generateUUIDStub.calledWith(cryptoMock)).to.be.true;
    });

    it('should create PlaceholderSerializer instance with UUID returned by generateUUID', () => {
        expect(placeholderSerializerSpy.calledOnce).to.be.true;
        expect(placeholderSerializerSpy.calledWith('00000000000000000000000000000')).to.be.true;
    });

    it('should invoke PlaceholderSerializer.serialize and return it\'s result', () => {
        const toSerialize = { test: 1}
        const serialized = serializeFn(toSerialize);

        expect(serializeStub.calledOnce).to.be.true;
        expect(serializeStub.calledWith(toSerialize)).to.be.true;
        expect(serialized).to.be.equal('serialized-data');
    });
});
