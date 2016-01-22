'use strict';

var Twit = require('Twit');
var Q = require('q');

function API(config) {
	this.client = new Twit({
		consumer_key: config.TWT_CONSUMER_KEY,
		consumer_secret: config.TWT_CONSUMER_SECRET,
		access_token: config.TWT_ACCESS_TOKEN,
		access_token_secret: config.TWT_ACCESS_TOKEN_SECRET
	});
}

function _parseScreenName(screenName) {
	if (screenName.indexOf('@') === 0) {
		screenName = screenName.substring(1, screenName.length);
	}
	return screenName;
}

API.prototype.unfollow = function(screenName) {
	var deferred = Q.defer();

	screenName = _parseScreenName(screenName);

	this.client.post('friendships/destroy', {
		screen_name: screenName
	}, function(err, data, response) {
		if (err || !data) {
			deferred.reject('Error unfollowing @' + screenName + ' / ' + err.message);
		}

		deferred.resolve();
	});

	return deferred.promise;
}

API.prototype.friends = function() {
	var api = this,
		deferred = Q.defer(),
		friends = [],
		nextCursor = -1;

	(function getFriends() {
		api.client.get('friends/list', {
			cursor: nextCursor,
			count: 200
		}, function(err, data, response) {
			if (err) deferred.reject('Error retrieving friends list. / ' + err.message);

			friends = friends.concat(data.users);
			nextCursor = data.next_cursor;

			if (nextCursor == 0) {
				deferred.resolve(friends);
			} else {
				getFriends();
			}
		})
	})();

	return deferred.promise;
}

module.exports = API;















