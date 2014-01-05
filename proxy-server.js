var JsonProxy = require('./lib/JsonProxy.js');
var config = require('./lib/config');
var util = require('util');
var http = require('http');

var proxy = new JsonProxy(config);

var server = http.createServer(function(request, response) {

	proxy.accept(request, function() {
		response.end();
	});

});

server.on('listening', function() {
	console.log('proxy server listening on port %d', config.port);
	console.log('config: %s', util.inspect(config));
});

server.listen(config.port);