var rc = require('rc');

// do not change this, instead create a .json-proxyrc file and override specific configurations
var defaults = {
	port: 8181,
	targets: {
		"http://localhost/": 10
	},
	backoffAlgorithm: {
		maxRetries: 10,
		timeSlot: 1000 // basic time slot for calculating delay between retries
	}
};

module.exports = rc('json-proxy', defaults);