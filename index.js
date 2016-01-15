'use strict';

var API = require('./modules/API.js');

var argv = require('yargs')
	.usage('$0 <command>')
	.options({
		'u': {
			alias: 'user',
			describe: 'twitter username to unfollow',
			nargs: 1,
			type: 'string'
		}
	})
	.argv;

var api = new API(process.env);

if (argv.user) {
	api.unfollow(argv.user, function(err, data) {
		if (err) {
			console.log(err.message);
		} else {
			console.log(data.message);
		}
	});
}