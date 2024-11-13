import { expect } from 'chai';
import { generateUUID } from '../../src/generateUUID';

describe('generateUUID', () => {
    const UID_LENGTH = 16;

    it('should generate a UUID using randomUUID when available', () => {
        const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
        const randomGeneratorWithUUID = {
            randomUUID: () => mockUUID,
            getRandomValues: (arr: Uint8Array) => arr,
        };

        const result = generateUUID(randomGeneratorWithUUID);
 
        expect(result).to.equal(mockUUID.replace(/-/g, ''));
    });

    it('should generate a UUID using getRandomValues when randomUUID is not available', () => {
        const randomBytes = new Uint8Array(UID_LENGTH).map(() => Math.floor(Math.random() * 256));
        const randomGeneratorWithoutUUID = {
            getRandomValues: (arr: Uint8Array) => {
                arr.set(randomBytes);
                return arr;
            },
        };

        const result = generateUUID(randomGeneratorWithoutUUID);

        expect(result).to.match(/^[0-9a-f]+$/);

        const expectedHexString = Array.from(randomBytes)
            .map(byte => byte.toString(16))
            .join('');
        expect(result).to.equal(expectedHexString);
    });
});
