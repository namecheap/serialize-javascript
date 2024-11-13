import { BidirectionalMap } from './BidirectionalMap';
import { deleteFunctions } from './deleteFunctions';
import { escapeUnsafeChars } from './escapeUnsafeChars';
import { SerializerOptions } from './interfaces/SerializerOptions';

type PlaceholderedValues = {
    url: URL[];
    date: Date[];
    array: any[];
    undefined: any[];
    set: Set<any>[];
    regExp: RegExp[];
    bigint: BigInt[];
    infinity: any[];
    map: Map<any, any>[];
    function: Function[];
};

type StringifiedWithPlaceholders = {
    stringified: string;
    placeholdered: PlaceholderedValues;
};

type ValueTypes = 'regExp' | 'date' | 'map' | 'set' | 'array'  |'url' | 'function' | 'undefined' | 'infinity' | 'bigint';

const RESERVED_SYMBOLS = ['*', 'async'];

const IS_ARROW_FUNCTION = /.*?=>.*?/;
const IS_PURE_FUNCTION = /function.*?\(/;
const UNSAFE_CHARS_REGEXP   = /[<>\/\u2028\u2029]/g;
const IS_NATIVE_CODE_REGEXP = /\{\s*\[native code\]\s*\}/g;

const typesPlaceholderIdentifier: BidirectionalMap<ValueTypes, string> = new BidirectionalMap([
    ['map', 'M'],
    ['url', 'L'],
    ['set', 'S'],
    ['date', 'D'],
    ['array', 'A'],
    ['bigint', 'B'],
    ['regExp', 'R'],
    ['infinity', 'I'],
    ['function', 'F'],
    ['undefined', 'U'],
]);

const objectTypeMap = new Map<Function, ValueTypes>([
    [Map, 'map'],
    [Set, 'set'],
    [URL, 'url'],
    [Date, 'date'],
    [Array, 'array'],
    [RegExp, 'regExp'],
]);

export class PlaceholderSerializer {
    private PLACE_HOLDER_REGEXP: RegExp;
    
    constructor(private UID: string) {
        const placeholderIdentifiers = Array.from(typesPlaceholderIdentifier.values());
        this.PLACE_HOLDER_REGEXP = new RegExp(`(\\\\)?"@__(${placeholderIdentifiers.join('|')})-${this.UID}-(\\d+)__@"`, 'g');
    }

    private getValueTypeName(value: any): ValueTypes | string {
        const valueType = typeof value;

        if (valueType === 'object' && value !== null) {
            for (const [constructor, typeName] of objectTypeMap) {
                if (value instanceof constructor) {
                    return typeName;
                }
            }
        }

        if (valueType === 'number' && !isNaN(value) && !isFinite(value)) {
            return 'infinity';
        }

        return valueType;
    }

    private generatePlaceholder(placeholderIdentifier, valueIndex): string {
        return `@__${placeholderIdentifier}-${this.UID}-${valueIndex}__@`;
    }

    private stringifyWithPlaceholders(obj, options: SerializerOptions): StringifiedWithPlaceholders {
        const placeholdered: Record<ValueTypes, Array<any>> = {
            map: [],
            set: [],
            url: [],
            date: [],
            array: [],
            bigint: [],
            regExp: [],
            function: [],
            infinity: [],
            undefined: [],
        };

        const self = this;

        // Returns placeholders for functions and regexps (identified by index)
        // which are later replaced by their string representation.
        function replacer(key, value) {
            // For nested function
            if (options?.ignoreFunction) {
                deleteFunctions(value);
            }

            if (!value && value !== undefined && value !== BigInt(0)) {
                return value;
            }

            // If the value is an object w/ a toJSON method, toJSON is called before
            // the replacer runs, so we use this[key] to get the non-toJSONed value.
            // @ts-ignore
            const originalValue = this[key];  
            const typeName = self.getValueTypeName(originalValue);

            const placeholderedValueDestination: Array<any> | undefined = placeholdered[typeName]; 
            const typePlaceholderIndentifier: string | undefined = typesPlaceholderIdentifier.getByKey(typeName as ValueTypes);

            if (typeName === 'array') {
                var isSparse = originalValue.filter(() => true).length !== originalValue.length;

                if (isSparse) {
                    return self.generatePlaceholder(typePlaceholderIndentifier, placeholdered.array.push(originalValue) - 1);
                }
            } else if (typePlaceholderIndentifier && placeholderedValueDestination) {
                return self.generatePlaceholder(typePlaceholderIndentifier, (placeholderedValueDestination.push(originalValue) - 1));
            }

            return value;
        }

        let stringified;

        // Creates a JSON string representation of the value.
        // NOTE: Node 0.12 goes into slow mode with extra JSON.stringify() args.
        if (options?.isJSON && !options.space) {
            stringified = JSON.stringify(obj);
        } else {
            stringified = JSON.stringify(obj, options?.isJSON ? undefined : replacer, options?.space);
        }

        return {
            stringified,
            placeholdered,
        };
    }

    public serializeFunction(fn: Function): string {
        const serializedFn = fn.toString();

        if (IS_NATIVE_CODE_REGEXP.test(serializedFn)) {
            throw new TypeError('Serializing native function: ' + fn.name);
        }

        // pure functions, example: {key: function() {}}
        if (IS_PURE_FUNCTION.test(serializedFn)) {
            return serializedFn;
        }

        // arrow functions, example: arg1 => arg1+5
        if (IS_ARROW_FUNCTION.test(serializedFn)) {
            return serializedFn;
        }

        const argsStartsAt = serializedFn.indexOf('(');
        const definition = serializedFn.substr(0, argsStartsAt)
            .trim()
            .split(' ')
            .filter((value) => value.length > 0);

        const nonReservedSymbols = definition.filter((value) => RESERVED_SYMBOLS.indexOf(value) === -1);

        // enhanced literal objects, example: {key() {}}
        if (nonReservedSymbols.length > 0) {
            return (definition.indexOf('async') > -1 ? 'async ' : '') + 'function'
                + (definition.join('').indexOf('*') > -1 ? '*' : '')
                + serializedFn.substr(argsStartsAt);
        }

        // arrow functions
        return serializedFn;
    }

    public serialize(obj, opts: SerializerOptions | number | string = {}): string {
        let options: SerializerOptions = {};

        // Backwards-compatibility for `space` as the second argument.
        if (typeof opts === 'number' || typeof opts === 'string') {
            options = { space: opts };
        } else {
            options = opts;
        }

        // Check if the parameter is function
        if (options?.ignoreFunction && typeof obj === "function") {
            obj = undefined;
        }
        // Protects against `JSON.stringify()` returning `undefined`, by serializing
        // to the literal string: "undefined".
        if (obj === undefined) {
            return String(obj);
        }

        const {
            placeholdered,
            stringified,
        } = this.stringifyWithPlaceholders(obj, options);

        // Protects against `JSON.stringify()` returning `undefined`, by serializing
        // to the literal string: "undefined".
        if (typeof stringified !== 'string') {
            return String(stringified);
        }

        let str = stringified;

        // Replace unsafe HTML and invalid JavaScript line terminator chars with
        // their safe Unicode char counterpart. This _must_ happen before the
        // regexps and functions are serialized and added back to the string.
        if (options?.unsafe !== true) {
            str = str.replace(UNSAFE_CHARS_REGEXP, escapeUnsafeChars);
        }

        const hasPlaceholderedValues = Object.keys(placeholdered).some((typeName) => placeholdered[typeName].length > 0);

        if (!hasPlaceholderedValues) {
            return str;
        }

        // Replaces all occurrences of function, regexp, date, map and set placeholders in the
        // JSON string with their string representations. If the original value can
        // not be found, then `undefined` is used.
        return str.replace(this.PLACE_HOLDER_REGEXP, (match, backSlash, placeholderIdentifier, valueIndex) => {
            // The placeholder may not be preceded by a backslash. This is to prevent
            // replacing things like `"a\"@__R-<UID>-0__@"` and thus outputting
            // invalid JS.
            if (backSlash) {
                return match;
            }

            const typeName = typesPlaceholderIdentifier.getByValue(placeholderIdentifier);

            switch (typeName) {
                case 'date':
                    return `new Date("${placeholdered.date[valueIndex].toISOString()}")`;
            
                case 'regExp':
                    return `new RegExp(${this.serialize(placeholdered.regExp[valueIndex].source)}, "${placeholdered.regExp[valueIndex].flags}")`;
            
                case 'map':
                    return `new Map(${this.serialize(Array.from(placeholdered.map[valueIndex].entries()), options)})`;
            
                case 'set':
                    return `new Set(${this.serialize(Array.from(placeholdered.set[valueIndex].values()), options)})`;
            
                case 'array':
                    return `Array.prototype.slice.call(${this.serialize({
                        length: placeholdered.array[valueIndex].length,
                        ...placeholdered.array[valueIndex]
                    }, options)})`;
            
                case 'undefined':
                    return 'undefined';
            
                case 'infinity':
                    return placeholdered.infinity[valueIndex];
            
                case 'bigint':
                    return `BigInt("${placeholdered.bigint[valueIndex]}")`;
            
                case 'url':
                    return `new URL(${this.serialize(placeholdered.url[valueIndex].toString(), options)})`;
            
                default:
                    const fn = placeholdered.function[valueIndex];
                    return this.serializeFunction(fn);
            }
        });
    }
}
