var EventEmitter = require('events').EventEmitter;
var $u = require('util');

function Host(address, maxConcurrency, currentConcurrency) {
	this.address = address;
	this.maxConcurrency = maxConcurrency;
	this.currentConcurrency = currentConcurrency || 0;
}

/*
	compare hosts:

	1. if both have 0 current concurrency - the one with the bigger max concurrency should be bigger
	2. if one has 0 current and the other does not, return the one with 0 current
	3. if both have current > 0 return the one with smaller ratio between max and current.
*/
function hostComparator(t1, t2) {

	if (t1.currentConcurrency === 0 && t2.currentConcurrency === 0)
		return t2.maxConcurrency - t1.maxConcurrency;

	if (t1.currentConcurrency === 0 && t2.currentConcurrency > 0)
		return -1;

	if (t1.currentConcurrency > 0 && t2.currentConcurrency === 0)
		return 1;

	var t2Ratio = t2.currentConcurrency / t2.maxConcurrency;
	var t1Ratio = t1.currentConcurrency / t1.maxConcurrency;

	return t1Ratio - t2Ratio;
}

function HostConcurrencyManager(hosts) {

	EventEmitter.call(this);

	this.setMaxListeners(0);

	if (!hosts)
		throw new Error('must provider a hash of hosts (e.g { \'1.2.3.4\': 10 })');

	this._elements = [];
	this._index = {};

	for (var address in hosts) {
		var maxConcurrency = hosts[address];

		if (maxConcurrency === 0)
			throw new Error('0 concurrency level is now allowed, found in host: ' + address);

		var host = new Host(address, maxConcurrency);

		this._elements.push(host);
		this._index[address] = host;
	}

	if (this._elements.length === 0) {
		throw new Error('no hosts were specified in constructor!');
	}

	this._sort();
}

$u.inherits(HostConcurrencyManager, EventEmitter);

HostConcurrencyManager.prototype.hosts = function () {
	return this._elements;
};

/*

*/
HostConcurrencyManager.prototype.getAvailable = function() {

	var host = this._elements[0];

	if (host.currentConcurrency < host.maxConcurrency) {
		return host.address;
	}

	//otherwise return nothing
};

HostConcurrencyManager.prototype.occupy = function(address) {
	var host = this._index[address];

	if (host === undefined)
		throw new Error('invalid host: ' + address + ' does not exist in this manager instance');

	if (host.currentConcurrency + 1 > host.maxConcurrency)
		throw new Error('cannot occupy this host as it reached its maximum concurrency level');

	host.currentConcurrency++;

	this._sort();
};

HostConcurrencyManager.prototype.release = function (address) {

	var host = this._index[address];

	if (host === undefined)
		throw new Error('invalid host: ' + address + ' does not exist in this manager instance');

	if (host.currentConcurrency - 1 < 0)
		throw new Error('this host was already released');

	host.currentConcurrency--;

	this._sort();


	/*
		a crude hack to only fire one listener, instead of all of them.

		this is done because when a listener is fired and uses a host the next one might
		call getAvailable() and get nothing and it doesn't makes sense if the listener
		waits for "host available event" he expects to get an available host
	 */
	var listeners = this.listeners('host available');

	if (listeners.length > 0) {

		this.removeAllListeners('host available');

		this.once('host available', listeners.pop());
		this.emit('host available', this);

		// reregister all the other listeners
		for (var i = 0; i < listeners.length; i++) {
			this.once('host available', listeners[i]);
		}
	}
};

HostConcurrencyManager.prototype._sort = function () {
	this._elements.sort(hostComparator);
};


module.exports = HostConcurrencyManager;