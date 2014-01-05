var FlowControlStream = require('../lib/FlowControlStream.js');
var path = require('path');
var fs = require('fs');
var util = require('util');
var Writable = require('stream').Writable;
var assert = require('assert');

util.inherits(TestStream, Writable);
function TestStream(options) {
	Writable.call(this, options);

	this.log = [];
}

TestStream.prototype._write = function(chunk, encoding, callback) {
	this.log.push(chunk);

	callback(null, chunk);
};

var filename = path.join(__dirname, 'testdata');
var testData = fs.readFileSync(filename);

describe('FlowControlStream', function () {
	it('can be paused and resumed', function (done) {
		this.timeout(5000);

		var fcs = new FlowControlStream();

		var stream = fs.createReadStream(filename);

		var testStream = new TestStream();

		fcs.pauseStream();

		setTimeout(function() {
			fcs.resumeStream();
		}, 500);

		setTimeout(function() {
			assert.strictEqual(testStream.log.length, 0);
		}, 200);

		setTimeout(function() {
			assert.deepEqual(testStream.log[0], testData);
		}, 1000);

		setTimeout(function () {
			done();
		}, 1500);

		stream.pipe(fcs).pipe(testStream);
	});
});