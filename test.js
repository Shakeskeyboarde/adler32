#!/usr/bin/env node

var should = require('should');
var fs = require('fs');
var Adler32 = require('./');
var hash = require('mhash').hash;

var buf = fs.readFileSync(__filename);

describe('Adler32', function() {
	describe('.sum(buf, adler = 1)', function() {
		var sum = Adler32.sum(buf);

		it('should return a number above 0 and below 4293984241', function() {
			sum.should.be.above(0);
			sum.should.be.below(4293984241);
		});

		it('should match the sum calculated by mhash', function() {
			sum.should.be.exactly(parseInt(hash('adler32', buf), 16));
		});

		it('should be the same if done as a running sum', function() {
			var half = (buf.length / 2)<<0;
			var part0 = buf.slice(0, half);
			var part1 = buf.slice(half);
			var partial = Adler32.sum(part0);
			var sum0 = Adler32.sum(buf);
			var sum1 = Adler32.sum(part1, partial);

			sum1.should.be.exactly(sum0);
		});
	});

	describe('.roll(sum, length, oldByte, newByte = null)', function() {
		it('should result in the same value as sum for each offset chunk of size 64', function() {
			rollTest(64);
		});

		it('should result in the same value as sum for each offset chunk of size 128', function() {
			rollTest(128);
		});

		it('should result in the same value as sum for each offset chunk of size 256', function() {
			rollTest(256);
		});

		it('should result in the same value as sum for each offset chunk of size 512', function() {
			rollTest(512);
		});

		it('should result in the same value as sum for each offset chunk of size 1024', function() {
			rollTest(1024);
		});

		it('should result in the same value as sum for each offset chunk of size 2048', function() {
			rollTest(2048);
		});

		it('should result in the same value as sum for each offset chunk of size 4096', function() {
			rollTest(4096);
		});

		it('should result in the same value as sum for each offset chunk of size 8192', function() {
			rollTest(8192);
		});

		it('should result in the same value as sum for each offset chunk of size 16384', function() {
			rollTest(16384);
		});
	});
});

function rollTest(chunkSize)
{
	var sum = Adler32.sum(buf.slice(0, chunkSize));
	var i = 0;

	for (; i < buf.length; ++i)
	{
		sum = Adler32.roll(sum, Math.min(chunkSize, buf.length - i), buf[i], buf[i + chunkSize]);
		sum.should.be.exactly(Adler32.sum(buf.slice(i + 1, i + 1 + chunkSize)));
	}
}
