'use strict';

var API = require('./API.js');
var Q = require('q');
var moment = require('moment');
var inquirer = require('inquirer');
var colors = require('colors');


var api = new API(process.env);

function program(argv) {
	var messageBuffer = [];

	if (argv.user) {
		unfollowUser(argv.user);
	}

	if (argv.stale) {
		unfollowStaleUsers(argv);
	}
}

function unfollowUser(user) {
	api.unfollow(user)
	   .then(function() {
	   		console.log('Unfollowed %s', user)
	   })
	   .fail(function(error) {
	   		console.log(error.message);
	   });
}

function unfollowStaleUsers(argv) {
	var messageBuffer = [];

	api.friends()
	    .then(onFriendsReturn);

	function onFriendsReturn(friends) {
    	friends = friends.filter(isContentStale(argv.stale));

    	if (!friends) {
    		console.log('No friends have content more than %s days stale.', argv.stale);
    		return;
    	}

    	(function iterate() {
    		var user = friends.shift();

    		promptUnfollow(user)
    			.then(onAnswer);

    		function onAnswer(answers) {
				if (answers.confirmUnfollow) {
					api.unfollow(user.screen_name)
						.then(function() {
							messageBuffer.push('Unfollowed @%s', user.screen_name);
						});
				}

				// print and clear buffer
				printArray(messageBuffer);
				messageBuffer = [];

				if (friends.length > 0) {
					iterate();
				}
			}
    	})();
    }
}

function promptUnfollow(user) {
	var deferred = Q.defer();

	displayTweet(user);

	inquirer.prompt([{
		type: 'confirm',
		name: 'confirmUnfollow',
		message: 'Unfollow @' + user.screen_name + '?'
	}], function onAnswer(answers) {
		deferred.resolve(answers);
	})

	return deferred.promise();
}

function printArray(arr) {
	var tmp = arr.slice();

	while (tmp.length) {
		console.log(tmp.pop());
	}
}

function isContentStale(days) {
	return function(user) {
		var now = moment(),
			lastStatusTime;

		if (user.status && user.status.created_at) {
			lastStatusTime = moment(new Date(user.status.created_at));
			return lastStatusTime < now.subtract(days, 'days');
		}

		return true;
	};
}

function displayTweet(user) {
	var width = process.stdout.columns - 10,
		time,
		message,
		splitRegex;

	if (!user.status || !user.status.text || !user.status.created_at) {
		return '';
	}

	// this splits the message into string array with chunks of equal width
	splitRegex = new RegExp('.{1,' + (width - '|  |'.length - 1) + '}', 'g');
	message = user.status.text.match(splitRegex);

	time = moment(new Date(user.status.created_at)).fromNow();

	console.log(
		Array(width).join('_'));

	console.log(
		'|', user.name.bold.blue, Array(width - '|   |'.length - user.name.length).join(' '), '|');

	console.log(
		'|', ('@' + user.screen_name).bold.blue, Array(width - '|   @|'.length - user.screen_name.length).join(' '), '|');

	console.log(
		'|', Array(width - '|  |'.length).join(' '), '|');

	message.forEach((substr) => {
		console.log(
			'|', substr, Array(width - substr.length - '|   |'.length).join(' '), '|');
	});

	console.log(
		'|', Array(width - '|  |'.length).join(' '), '|');

	console.log(
		'|', time.italic, Array(width - time.length - '|   |'.length).join(' '), '|');

	console.log(
		'|', Array(width - '|  |'.length).join('_'), '|');
}

module.exports = program;