import sinon from 'sinon';
import { expect } from 'chai';
import crypto from '../../src/crypto';
import * as generateUUIDModule from '../../src/generateUUID';
import * as placeholderSerializerModule from '../../src/Serializer/PlaceholderSerializer';

describe('Entrypoint', () => {
    let serializeStub: sinon.SinonStub;
    let generateUUIDStub: sinon.SinonStub;
    let placeholderSerializerSpy: sinon.SinonSpy;
    let serializeFn;

    before(() => {
        generateUUIDStub = sinon.stub(generateUUIDModule, 'generateUUID');
        generateUUIDStub.returns('00000000000000000000000000000');

        placeholderSerializerSpy = sinon.spy(placeholderSerializerModule, 'PlaceholderSerializer');

        serializeStub = sinon.stub(placeholderSerializerModule.PlaceholderSerializer.prototype, 'serialize').returns('serialized-data');

        const { serialize } = require('../../src/index');
        serializeFn = serialize;
    });

    after(() => {
        sinon.restore();
    });

    it('should invoke genereUUID function with crypto', () => {
        expect(generateUUIDStub.calledOnce).to.be.true;
        expect(generateUUIDStub.calledWith(crypto)).to.be.true;
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
