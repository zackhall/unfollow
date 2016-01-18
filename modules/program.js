'use strict';

var API = require('./API.js');
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
	api.unfollow(user, function(err, data) {
		if (err) {
			console.log(err.message);
		} else if (data) {
			console.log(data.message);
		}
	});
}

function unfollowStaleUsers(argv) {
	var messageBuffer = [];

	api.friends(onFriendsResponse);

	function onFriendsResponse(err, data) {
		if (err) {
			console.log(err.message);
		} else if (data) {
			var friends = 
				data.friends.filter(
					isContentStale(argv.stale));

			if (friends.length == 0) {
				console.log("No friends have content more than %s days stale.", argv.stale);
				return;
			}

			(function promptUnfollow() {
				var user = friends.shift();

				displayTweet(user);

				inquirer.prompt([{
					type: 'confirm',
					name: 'confirmUnfollow',
					message: 'Unfollow @' + user.screen_name + '?'
				}], onAnswer);

				function onAnswer(answers) {
					if (answers.confirmUnfollow) {
						api.unfollow(user.screen_name, addToBuffer);
					}

					flushBuffer();

					if (friends.length > 0) {
						promptUnfollow();
					}
				}
			})();
		}
	}

	function addToBuffer(err, data) {
		if (err) {
			messageBuffer.push(err.message);
		} else if (data) {
			messageBuffer.push(data.message);
		}
	}

	function flushBuffer() {
		while (messageBuffer.length) {
			console.log(messageBuffer.pop());
		}
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