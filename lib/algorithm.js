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

exports.sum = function(buf, sum)
{
	if (sum == null)
		sum = 1;

	var a = sum & 0xFFFF,
		b = (sum >>> 16) & 0xFFFF,
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