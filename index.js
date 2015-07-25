#!/usr/bin/env node
"use strict";

var algorithm = require('./lib/algorithm');
var Hash = require('./lib/Hash');
var register = require('./lib/register');

exports.sum = algorithm.sum.bind(algorithm);
exports.roll = algorithm.roll.bind(algorithm);
exports.Hash = Hash;
exports.register = register;
