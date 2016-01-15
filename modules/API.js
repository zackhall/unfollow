'use strict';

var Twit = require("Twit");

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

API.prototype.unfollow = function(screenName, callback) {
	screenName = _parseScreenName(screenName);

	this.client.post('friendships/destroy', {
		screen_name: screenName
	}, function(err, data, response) {
		var message; 

		if (err) {
			message = 'Error unfollowing @' + screenName + ' / ' + err.message;
			return callback(new Error(message));
		}

		if (data) {
			return callback(null, {
				message: 'Unfollowed @' + screenName
			});
		}
	})
}

module.exports = API;