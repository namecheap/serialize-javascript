import { expect } from 'chai';
import { BidirectionalMap } from '../../../src/Serializer/BidirectionalMap';

describe('BidirectionalMap', () => {
    let biMap: BidirectionalMap<string, number>;

    beforeEach(() => {
        biMap = new BidirectionalMap();
    });

    it('should initialize with empty map when no entries are provided', () => {
        expect(biMap.hasKey('key')).to.be.false;
        expect(biMap.hasValue(42)).to.be.false;
    });

    it('should initialize with entries when provided', () => {
        const entries: [string, number][] = [['a', 1], ['b', 2]];
        biMap = new BidirectionalMap(entries);

        expect(biMap.getByKey('a')).to.equal(1);
        expect(biMap.getByValue(2)).to.equal('b');
    });

    it('should set new key-value pairs correctly', () => {
        biMap.set('a', 1);
        biMap.set('b', 2);

        expect(biMap.getByKey('a')).to.equal(1);
        expect(biMap.getByKey('b')).to.equal(2);
        expect(biMap.getByValue(1)).to.equal('a');
        expect(biMap.getByValue(2)).to.equal('b');
    });

    it('should update existing key-value pairs correctly', () => {
        biMap.set('a', 1);
        biMap.set('a', 2);

        expect(biMap.getByKey('a')).to.equal(2);
        expect(biMap.getByValue(1)).to.be.undefined;
        expect(biMap.getByValue(2)).to.equal('a');
    });

    it('should update existing key-value pairs correctly', () => {
        biMap.set('a', 2);
        biMap.set('b', 2);

        expect(biMap.getByKey('b')).to.equal(2);
        expect(biMap.getByValue(2)).to.equal('b');
    });

    it('should delete by key', () => {
        biMap.set('a', 1);
        biMap.deleteByKey('a');

        expect(biMap.getByKey('a')).to.be.undefined;
        expect(biMap.getByValue(1)).to.be.undefined;
    });

    it('should delete by value', () => {
        biMap.set('a', 1);
        biMap.deleteByValue(1);

        expect(biMap.getByKey('a')).to.be.undefined;
        expect(biMap.getByValue(1)).to.be.undefined;
    });

    it('should return true if a key exists', () => {
        biMap.set('a', 1);
        expect(biMap.hasKey('a')).to.be.true;
        expect(biMap.hasKey('b')).to.be.false;
    });

    it('should return true if a value exists', () => {
        biMap.set('a', 1);
        expect(biMap.hasValue(1)).to.be.true;
        expect(biMap.hasValue(2)).to.be.false;
    });

    it('should return the correct iterator for keys', () => {
        biMap.set('a', 1);
        biMap.set('b', 2);
        const keys = Array.from(biMap.keys());

        expect(keys).to.deep.equal(['a', 'b']);
    });

    it('should return the correct iterator for values', () => {
        biMap.set('a', 1);
        biMap.set('b', 2);
        const values = Array.from(biMap.values());

        expect(values).to.deep.equal([1, 2]);
    });
});
