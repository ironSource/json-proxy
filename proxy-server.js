#!/usr/bin/env node

var JsonProxy = require('./lib/JsonProxy.js');
var config = require('./lib/config');

var targets = Object.keys(config.targets)
if (targets.length === 0) {
	console.error('must specify at least one target, try --targets."http://localhost"=1')
	process.exit(1)
}

var util = require('util');
var http = require('http');

var proxy = new JsonProxy(config);

var server = http.createServer(function(request, response) {

	proxy.accept(request, function(err) {
		if (err) {
			response.statusCode = 500
		}
		
		response.end();
	});

});

server.on('listening', function() {
	console.log('proxy server listening on port %d', config.port);
	console.log('config: %s', util.inspect(config));
});

server.listen(config.port);