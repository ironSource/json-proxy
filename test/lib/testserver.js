var http = require('http');
var port = process.env.port || 8181;
var delay = process.env.delay;
var error = process.env.error;

var fs = require('fs');
var path = require('path');
var util = require('util');

var directory = path.resolve(__dirname, '..', 'localhost-' + port);

if (fs.existsSync(directory)) {
	var stat = fs.statSync(directory);

	if (!stat.isDirectory())
		throw new Error('cannot proceed because ' + directory + ' is not a directory, stat: ' + util.inspect(stat));

	var files = fs.readdirSync(directory);

	for (var i = 0; i < files.length; i++) {
		var file = path.join(directory, files[i]);

		fs.unlinkSync(file);
	}

} else {
	fs.mkdirSync(directory);
}

function readWhole(stream, callback) {

	var data = '';

	function read() {

		function readMore() {
			var result = stream.read();

			if (result) {
				data += result.toString('utf8');
				readMore();
			}
		}

		stream.on('readable', readMore);

		stream.on('end', function () {
			callback(null, data);
		});
	}

	read();
}

var requests = 0;

var server = http.createServer(function(request, response) {
	var filename = 'request' + (requests++);
	filename = path.join(directory, filename);
	var stream = fs.createWriteStream( filename)
	request.pipe(stream);

	stream.on('finish', function () {
		if (delay) {
			setTimeout(function () {

				response.end();
			}, delay);
		} else if (error) {
			response.statusCode = 500;
			response.end('error!');
		} else {
			response.end();
		}
	});
});

server.on('listening', function() {
	console.log('http server listening');
});

server.listen(port);

