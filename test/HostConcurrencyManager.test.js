var HostConcurrencyManager = require('../lib/HostConcurrencyManager.js');
var assert = require('assert');

var testHosts = {
	'1.2.3.2': 4,
	'1.2.3.3': 3,
	'1.2.3.4': 2,
	'1.2.3.5': 1
};


describe('HostConcurrencyManager', function () {

	it('will throw an error when hosts with 0 max concurrency at specified', function () {
		assert.throws(function () {
			new HostConcurrencyManager({ '1.2.3.4': 3, '1.2.3.5': 0 });
		}, Error);
	});

	it('will throw an error if hosts argument in the constructor does not contain no hosts', function() {
		assert.throws(function () {
			new HostConcurrencyManager();
		}, Error);

		assert.throws(function () {
			new HostConcurrencyManager({});
		}, Error);
	});

	it('sorts the hosts initially by their max concurrency', function () {
		var cm = new HostConcurrencyManager(testHosts);

		var hosts = cm.hosts();

		assert.strictEqual(hosts[0].address, '1.2.3.2');
		assert.strictEqual(hosts[0].maxConcurrency, 4);
		assert.strictEqual(hosts[0].currentConcurrency, 0);

		assert.strictEqual(hosts[1].address, '1.2.3.3');
		assert.strictEqual(hosts[1].maxConcurrency, 3);
		assert.strictEqual(hosts[1].currentConcurrency, 0);

		assert.strictEqual(hosts[2].address, '1.2.3.4');
		assert.strictEqual(hosts[2].maxConcurrency, 2);
		assert.strictEqual(hosts[2].currentConcurrency, 0);

		assert.strictEqual(hosts[3].address, '1.2.3.5');
		assert.strictEqual(hosts[3].maxConcurrency, 1);
		assert.strictEqual(hosts[3].currentConcurrency, 0);
	});

	describe('tracks usage of hosts', function () {

		it('returns unused hosts first, starting from the one with the highest max concurrency', function () {
			var cm = new HostConcurrencyManager(testHosts);
			var lbh = cm.getAvailable();

			assert.strictEqual(lbh, '1.2.3.2');

			cm.occupy(lbh);
			lbh = cm.getAvailable();
			assert.strictEqual(lbh, '1.2.3.3');

			cm.occupy(lbh);
			lbh = cm.getAvailable();
			assert.strictEqual(lbh, '1.2.3.4');

			cm.occupy(lbh);
			lbh = cm.getAvailable();
			assert.strictEqual(lbh, '1.2.3.5');
		});

		it('returns hosts with least load if there are no unused hosts - least load is the ratio between max and current concurrency', function () {
			var cm = new HostConcurrencyManager(testHosts);

			for (var host in testHosts)
				cm.occupy(host);

			cm.occupy('1.2.3.2');

			var lbh = cm.getAvailable();

			assert.strictEqual(lbh, '1.2.3.3');
		});

		it('returns nothing if all hosts are fully used', function () {
			var cm = new HostConcurrencyManager({ '1.1.1.1': 1 });

			cm.occupy('1.1.1.1');

			var lbh = cm.getAvailable();

			assert.strictEqual(lbh, undefined);
		});

		it('updates released hosts', function () {

			var cm = new HostConcurrencyManager(testHosts);

			assert.strictEqual(cm.getAvailable(), '1.2.3.2');

			cm.occupy('1.2.3.2');

			assert.strictEqual(cm.getAvailable(), '1.2.3.3');

			cm.release('1.2.3.2');

			assert.strictEqual(cm.getAvailable(), '1.2.3.2');
		});
	});
});