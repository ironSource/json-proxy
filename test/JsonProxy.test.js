var JsonProxy = require('../lib/JsonProxy.js');
var fs = require('fs');
var path = require('path');
var config = require('../lib/config.js');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var assert = require('assert');

var testDataFilename = path.join(__dirname, 'testdata');
var testdata = fs.readFileSync(testDataFilename, 'utf8');
var endOfLine = require('os').EOL;

function createIncomingStream() {
	return fs.createReadStream(testDataFilename);
}

describe('JsonProxy', function () {
	var conf;

	it('takes a stream of json objects and retransmits them one by one to another destination', function (done) {
		var proxy = new JsonProxy(conf);

		var requestData = [];
		var emitter = new EventEmitter();

		emitter.end = function (something) {
			requestData.push(JSON.parse(something));
		};

		proxy._http = {
			request: function() {
				return emitter;
			}
		};

		var stream = createIncomingStream();

		proxy.accept(stream, function() {
			assert.strictEqual(requestData.length, 10);

			// compare data to file
			var data = '';
			for (var i = 0; i < requestData.length; i++) {

				if (i > 0)
					data += endOfLine;

				data += JSON.stringify(requestData[i]);
			}

			assert.deepEqual(data, testdata);

			done();
		});

		emitter.emit('response', { statusCode: 200 });
	});

	beforeEach(function () {
		conf = _.cloneDeep(config);
		conf.targets['http://localhost'] = 10;
	});
});