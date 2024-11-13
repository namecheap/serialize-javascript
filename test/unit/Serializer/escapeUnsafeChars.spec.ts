import { expect } from 'chai';
import { escapeUnsafeChars } from '../../../src/Serializer/escapeUnsafeChars';

describe('escapeUnsafeChars', () => {
    it('should return the correct escaped value for <', () => {
        const input = '<';
        const expectedOutput = '\\u003C';

        const result = escapeUnsafeChars(input);
        expect(result).to.equal(expectedOutput);
    });

    it('should return the correct escaped value for >', () => {
        const input = '>';
        const expectedOutput = '\\u003E';

        const result = escapeUnsafeChars(input);
        expect(result).to.equal(expectedOutput);
    });

    it('should return the correct escaped value for /', () => {
        const input = '/';
        const expectedOutput = '\\u002F';

        const result = escapeUnsafeChars(input);
        expect(result).to.equal(expectedOutput);
    });

    it('should return the correct escaped value for \u2028', () => {
        const input = '\u2028'; // Unicode Line Separator character
        const expectedOutput = '\\u2028';

        const result = escapeUnsafeChars(input);
        expect(result).to.equal(expectedOutput);
    });

    it('should return the correct escaped value for \u2029', () => {
        const input = '\u2029'; // Unicode Paragraph Separator character
        const expectedOutput = '\\u2029';

        const result = escapeUnsafeChars(input);
        expect(result).to.equal(expectedOutput);
    });

    it('should return undefined for characters not in ESCAPED_CHARS', () => {
        const input = 'a'; // This is not in the ESCAPED_CHARS object
        const result = escapeUnsafeChars(input);

        expect(result).to.be.undefined;
    });
});
