import crypto from 'crypto';
import { expect } from 'chai';
import proxyquire from 'proxyquire';

describe('Crypto module', () => {
    let originalCrypto;
    let cryptoMock = {};

    beforeEach(() => {
        originalCrypto = global.crypto;

        Object.defineProperty(global, 'crypto', {
            value: cryptoMock,
            writable: true,
            configurable: true,
        });

        delete require.cache[require.resolve('../../src/crypto')];
    });

    afterEach(() => {
        Object.defineProperty(global, 'crypto', {
            value: originalCrypto,
            writable: true,
            configurable: true,
        });
    });

    it('should use global.crypto if available', () => {
        const cryptoModule = require('../../src/crypto').default;
        expect(cryptoModule).to.equal(cryptoMock);
    });

    it('should use require("crypto") if global.crypto is not available', () => {
        Object.defineProperty(global, 'crypto', {
            value: undefined,
            writable: true,
            configurable: true,
        });

        const cryptoModule = require('../../src/crypto').default;
        expect(cryptoModule).to.equal(crypto);
    });

    it('should throw an error if no crypto is available', () => {
        Object.defineProperty(global, 'crypto', {
            value: undefined,
            writable: true,
            configurable: true,
        });

        expect(() => proxyquire('../../src/crypto', {
            crypto: null,
        })).to.throw(
            'Cannot find module \'crypto\''
        );
    });
});
