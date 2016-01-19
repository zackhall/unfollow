#!/usr/bin/env node

'use strict';

require('babel-core/register');

var program = require('./modules/program.js');

var argv = require('yargs')
	.usage('$0 <command>')
	.options({
		'u': {
			alias: 'user',
			describe: 'twitter username to unfollow',
			nargs: 1,
			type: 'string'
		},
		's': {
			alias: 'stale',
			nargs: 1,
			describe: 'conditionally unfollow users whose data is stale by n days',
			type: 'number'
		}
	})
	.help('h').alias('h', 'help')
	.argv;

program(argv);