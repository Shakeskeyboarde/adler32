# adler32 [![Build Status](https://travis-ci.org/ChrisAckerman/adler32.svg?branch=master)](https://travis-ci.org/ChrisAckerman/adler32)

Adler-32 hashing algorithm with support for running and rolling checksums.

## Installation

	> npm install adler32
	> npm test

## Methods

	int sum(byte[]|Buffer data, [int current_sum])
	int roll(int sum, int sum_length, byte removed_byte, [byte added_byte])

## Examples

	var adler32 = require('adler32');
	var data = new Buffer('Hello World!');

To just calculate the checksum of an entire buffer:

	var sum = adler32.sum(data);

To calculate the checksum progressively (a running checksum):

	var sum = adler32.sum(data.slice(0, 5));  // Sums the first 5 bytes.
	sum = adler32.sum(data.slice(5), sum);    // Updates the sum with the reset of the buffer.

	assert.deepEqual(sum, adler32.sum(data)); // Should be the same sum as for the entire buffer calculated at once.

To do a rolling checksum calculation:

	var sum = adler32.sum(data.slice(0, 5));              // Again, start with the beginning 5 byte chunk of the buffer.
	sum = adler32.roll(sum, 5, data[0], data[5]);         // Move the sum forward one byte.
	sum = adler32.roll(sum, 5, data[1], data[6]);         // Move the sum forward another byte.

	assert.deepEqual(sum, adler32.sum(data.slice(2, 7))); // You should end up with the sum of bytes 2 through 6.

You can also move the rolling window beyond the end of the buffer which narrows the window:

	var sum = adler32.sum(data);                       // Start with the sum of the entire buffer.
	sum = adler32.roll(sum, data.length, data[0]);     // Move the sum forward one byte, removing the first byte. There is no next byte to add so the method is only given 3 arguments (null would also work). Note that the length argument is the length of the buffer used to calculate the original sum.
	sum = adler32.roll(sum, data.length - 1, data[1]); // Move the sum forward again. Note that the length is of the buffer represented by the previous sum.

	assert.deepEqual(sum, adler32.sum(data.slice(2))); // You should end up with the sum of the buffer minus the first two bytes.

The checksum is returned as a 32bit integer, but you can easily convert it to a hex string:

	var hex = adler32.sum(data).toString(16);

## `crypto` Module Integration

The adler32 algorithm can be integrated with the
[Node.js crypto module](http://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm). Calling the
`adler32.register()` static method will add the 'adler32' key to the crypto module's algorithm list.

Create an adler32 Hash instance using the crypto module:

	// Adds the 'adler32' key to the crypto.createHash() method.
	adler32.register();

	// Get an adler32 hash instance.
	var hash = crypto.createHash('adler32');

	// Add ascii data to the hash.
	hash.update(data, 'ascii');

	// Get a digest of all data added to the hash.
	var digest = hash.digest('hex');

Create an adler32 Hash instance directly:

	var hash = new adler32.Hash();

## Transform Stream Usage

Like the `crypto.Hash` class, `adler32.Hash` extends the `stream.Transform` class. You can use the stream `.write()` and
`.read()` methods in place of the legacy `.update()` and `.digest()` methods.

	var hash = new adler32.Hash({
		encoding: 'hex' // Sets the type of data returned by the read() method. Defaults to 'buffer'.
	});

	// Write data to the stream in multiple chunks.
	hash.write('foo');
	hash.write('bar');

	// This is important! No data will be available for reading until end() is called.
	hash.end();

	// Read should return a hexidecimal formatted string due to the encoding option being set to 'hex'.
	var hex_digest = hash.read();

See the [Node.js stream module](http://nodejs.org/api/stream.html) documentation for more information about streaming.

## Caveats

Using a rolling window larger than 35,184,372,088,832 (32TB) may cause unexpected results due to integer overflows.
Also, it's just silly.

## Notes

Modding of the upper and lower checksum words is delayed for up to 5,552 bytes when using the `sum()` method as a small
speed optimization.

This algorithm uses a base of 65521 (largest prime smaller than 65536) which is the base indicated by the original
Adler-32 algorithm. As such, the sums calculated by this utility *will* match those calculated by the mhash module.
Rsync uses the Adler-32 algorithm for its weak checksum, but uses a base of 65536 instead of 65521.

## License

The MIT License (MIT)

Copyright (c) 2014 Chris Ackerman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
