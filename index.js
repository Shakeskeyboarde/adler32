#!/usr/bin/env node
"use strict";

/**
 * Largest prime smaller than 2^16 (65536)
 */
var BASE = 65521;

/**
 * Largest value n such that 255n(n+1)/2 + (n+1)(BASE-1) <= 2^32-1
 *
 * NMAX is just how often modulo needs to be taken of the two checksum word halves to prevent overflowing a 32 bit
 * integer. This is an optimization. We "could" take the modulo after each byte, and it must be taken before each
 * digest.
 */
var NMAX = 5552;

exports.sum = function(buf, adler)
{
	if (adler == null)
		adler = 1;

	var a = adler & 0xFFFF,
		b = (adler >>> 16) & 0xFFFF,
		i = 0,
		max = buf.length,
		n, value;

	while (i < max)
	{
		n = Math.min(NMAX, max - i);

		do
		{
			a += buf[i++]<<0;
			b += a;
		}
		while (--n);

		a %= BASE;
		b %= BASE;
	}

	return ((b << 16) | a) >>> 0;
};

exports.roll = function(sum, length, oldByte, newByte)
{
	var a = sum & 0xFFFF,
		b = (sum >>> 16) & 0xFFFF;

	if (newByte != null)
	{
		a = (a - oldByte + newByte + BASE) % BASE;
		b = (b - ((length * oldByte) % BASE) + a - 1 + BASE) % BASE;
	}
	else
	{
		a = (a - oldByte + BASE) % BASE;
		b = (b - ((length * oldByte) % BASE) - 1 + BASE) % BASE;
	}

	return ((b << 16) | a) >>> 0;
};

var registered = false;

exports.register = function()
{
	if(registered) return;
	registered = true;

    var crypto = require('crypto');
	if(crypto.getHashes().indexOf('adler32') != -1)
	{
		console.log("WARNING: crypto module already supports adler32 - not registering")
	}
	else
	{
		var originalGetHashes = crypto.getHashes;
		var originalCreateHash = crypto.createHash;

		crypto.getHashes = function()
		{
			return originalGetHashes.call(crypto).concat(['adler32'])
		};

		crypto.createHash = function(hash)
		{
			if(hash === 'adler32')
			{
				return new Hash();
			}
			else
			{
				return originalCreateHash.call(crypto, hash);
			}
		};
	}
};

// Provides a node.js Hash style interface for adler32: http://nodejs.org/api/crypto.html#crypto_class_hash
var Hash = exports.Hash = function()
{
	this.adler = 1;
	this.done = false;
};

Hash.prototype.update = function(data, encoding)
{
	if (this.done) throw new Error("Cannot call update() after calling digest()");

	if (!(data instanceof Buffer))
	{
		if (encoding == null) {
			data = new Buffer(data, 'binary');
		}
		else
		{
			data = new Buffer(data, encoding);
		}
	}

    return this.adler = exports.sum(data, this.adler);
};

Hash.prototype.digest = function(encoding)
{
 	if (encoding == null) {
		encoding = 'binary';
	}

	this.done = true;

	var answer = new Buffer(4);
	answer.writeUInt32BE(this.adler, 0);
	return answer.toString(encoding);
};
