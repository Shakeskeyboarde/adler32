"use strict";

module.exports = function()
{
	var crypto = require('crypto');
	var Hash = require('./Hash');

	// Silently abort if the adler32 algorithm is already supported by the
	// crypto module.
	if (crypto.getHashes().indexOf('adler32') != -1)
		return;

	crypto.getHashes = function()
	{
		return this().concat(['adler32']);
	}
	.bind(crypto.getHashes.bind(crypto));

	crypto.createHash = function(algorithm)
	{
		if (algorithm === 'adler32')
			return new Hash();
		else
			return this(algorithm);
	}
	.bind(crypto.createHash.bind(this));
};