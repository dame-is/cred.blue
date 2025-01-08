const crypto = require('crypto');

// Generate a 64-byte (512-bit) random string in hexadecimal
const secretKey = crypto.randomBytes(64).toString('hex');
console.log('Your new SECRET_KEY is:', secretKey);
