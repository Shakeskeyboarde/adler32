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
var NMAX = 5521;

exports.sum = function(buf)
{
	var a = 1,
		b = 0,
		i = 0,
		max = buf.length,
		n, value;

	for (; i < max; ++i)
	{
		n = Math.min(NMAX, max - 1);

		do
		{
			a += buf[i];
			b += a;
		}
		while (--n);

		a %= BASE;
		b %= BASE;
	}

	return ((b << 16) | a) >>> 0;
};

exports.concat = function(sum0, sum1, length1)
{
	var a0 = sum0 & 0xFFFF,
		b0 = (sum0 >>> 16) & 0xFFFF,
		a1 = sum1 & 0xFFFF,
		b1 = (sum1 >>> 16) & 0xFFFF,
		a = (a0 + a1) % BASE,
		b = ((b0 * length1) + b1) % BASE;

	return ((b << 16) | a) >>> 0;
};

exports.roll = function(sum, length, oldByte, newByte)
{
	var a = sum & 0xFFFF,
		b = (sum >>> 16) & 0xFFFF;

	a = (a - oldByte + newByte) % BASE;
	b = (b - (length * oldByte) + a) % BASE;

	return ((b << 16) | a) >>> 0;
};
