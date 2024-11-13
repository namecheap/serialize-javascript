export class BidirectionalMap<K, V> {
    private keyToValue: Map<K, V> = new Map();
    private valueToKey: Map<V, K> = new Map();

    constructor(entries: [K, V][] = []) {
        for (const [key, value] of entries) {
            this.set(key, value);
        }
    }

    set(key: K, value: V): void {
        if (this.keyToValue.has(key)) {
            const oldValue = this.keyToValue.get(key)!;
            this.valueToKey.delete(oldValue);
        }

        if (this.valueToKey.has(value)) {
            const oldKey = this.valueToKey.get(value)!;
            this.keyToValue.delete(oldKey);
        }

        this.keyToValue.set(key, value);
        this.valueToKey.set(value, key);
    }

    getByKey(key: K): V | undefined {
        return this.keyToValue.get(key);
    }

    getByValue(value: V): K | undefined {
        return this.valueToKey.get(value);
    }

    deleteByKey(key: K): void {
        const value = this.keyToValue.get(key);
        if (value !== undefined) {
            this.keyToValue.delete(key);
            this.valueToKey.delete(value);
        }
    }

    deleteByValue(value: V): void {
        const key = this.valueToKey.get(value);
        if (key !== undefined) {
            this.valueToKey.delete(value);
            this.keyToValue.delete(key);
        }
    }

    hasKey(key: K): boolean {
        return this.keyToValue.has(key);
    }

    hasValue(value: V): boolean {
        return this.valueToKey.has(value);
    }

    keys(): MapIterator<K> {
        return this.valueToKey.values();
    }

    values(): MapIterator<V> {
        return this.keyToValue.values();
    }
}
