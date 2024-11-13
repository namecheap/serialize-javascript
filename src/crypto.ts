let crypto: Crypto;

if (typeof global !== 'undefined' && global.crypto) {
    crypto = global.crypto;
} else if (typeof require !== 'undefined' && typeof require === 'function') {
    crypto = require('crypto');
} else {
    throw new Error('No crypto available in this environment.');
}

export default crypto;
