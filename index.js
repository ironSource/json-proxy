var _ = require('lodash');

module.exports.Server = require('./lib/JsonProxy.js');

module.exports.config = function () {
	var conf = require('./lib/config.js');
	return _.cloneDeep(conf)
}

module.exports.FlowControlStream = require('./lib/FlowControlStream.js');
module.exports.HostConcurrencyManager = require('./lib/HostConcurrencyManager.js');