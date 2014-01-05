var JsonProxy = require('../lib/JsonProxy.js');
var config = require('../lib/config.js');
var fork = require('./lib/fork');
var path = require('path');
var _l = require('lodash');
var fs = require('fs');
var assert = require('assert');

var testFilename = path.join(__dirname, 'testdata');

config = _l.clone(config);

config.targets = {
	'http://localhost:7171/': 5,
	'http://localhost:7272/': 1
};

var dirs = [
	path.join(__dirname, 'localhost-7171'),
	path.join(__dirname, 'localhost-7272')
];

function forkTestServer(port) {
	return fork(path.join(__dirname, 'lib', 'testserver.js'), [], process.cwd(), { port: port });
}



describe('Json Proxy integration tests', function () {

	it('takes a stream of json objects and retransmits them one by one to other destinations', function(done) {
		this.timeout(20000);

		/*
			after all files have been retransmitted the test will collect the data
			written by the test http servers and check its integrity.

			this will be the "actual"
		*/
		var testWrittenData = [];

		/*
			in here I'll record the number of jsons directed to each server
		*/
		//var dirCount = {};

		var s1 = forkTestServer(7171);
		var s2 = forkTestServer(7272);
		var proxy = new JsonProxy(config);

		setTimeout(function () {

			proxy.accept(fs.createReadStream(testFilename), teardown);

		}, 1000);

		function collectAndCompareData() {

			for (var x = 0; x < dirs.length; x++) {
				var dir = dirs[x];
				var files = fs.readdirSync(dir);

				//dirCount[dir] = files.length;

				for (var i = 0; i < files.length; i++) {
					var fileData = fs.readFileSync(path.join(dir, files[i]));
					testWrittenData.push(JSON.parse(fileData));
				}
			}

			testWrittenData.sort(function(a, b) {
				return a.a - b.a;
			});

			assert.strictEqual(testWrittenData.length, 10);

			for (var l = 0; l < testWrittenData.length; l++) {
				var entry = testWrittenData[l];
				assert.strictEqual(entry.a, l);
			}
		}

		function teardown() {

			setTimeout(collectAndCompareData, 4000);
			setTimeout(function () {
				s1.kill();
				s2.kill();
				done();
			}, 6000);
		}
	});
});

