var config = require('./config.js');

var timeSlot = config.backoffAlgorithm.timeSlot;

var random = module.exports.random = function (start, end) {
    var range = end - start;
    return Math.floor((Math.random() * range) + start);
};

//Exponential backoff: http://en.wikipedia.org/wiki/Exponential_backoff
var randomExponentialBackoff = module.exports.randomExponentialBackoff = function(retries) {

	// wait anywhere between zero to 2^retries inclusive (hence +1)
	return random(0, Math.pow(2, retries) + 1);
};

module.exports.getNextRetry = function(retries) {

	return randomExponentialBackoff(retries) * timeSlot;
};