import { expect } from 'chai';
import { deleteFunctions } from '../../../src/Serializer/deleteFunctions';

describe('deleteFunctions', () => {
    it('should delete function properties from the object', () => {
        const obj = {
            a: 1,
            b: () => {},
            c: 'hello',
            d: function () {},
        };

        deleteFunctions(obj);

        expect(obj).to.have.property('a').that.equals(1);
        expect(obj).to.have.property('c').that.equals('hello');
        expect(obj).to.not.have.property('b');
        expect(obj).to.not.have.property('d');
    });

    it('should not modify an object without function properties', () => {
        const obj = {
            a: 1,
            b: 'test',
            c: { nested: true },
            d: [1, 2, 3],
        };

        deleteFunctions(obj);

        expect(obj).to.deep.equal({
            a: 1,
            b: 'test',
            c: { nested: true },
            d: [1, 2, 3],
        });
    });

    it('should handle an empty object without error', () => {
        const obj: Record<string, any> = {};

        deleteFunctions(obj);

        expect(obj).to.deep.equal({});
    });

    it('should handle objects with nested functions without deleting nested functions', () => {
        const d = function() {};

        const obj = {
            a: 1,
            b: () => {},
            c: {
                d,
                e: 'nested',
            },
        };

        deleteFunctions(obj);

        expect(obj).to.have.property('a').that.equals(1);
        expect(obj).to.not.have.property('b');

        expect(obj.c).to.deep.equal({
            d,
            e: 'nested',
        });
    });
});
