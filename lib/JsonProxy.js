/*
 * json-proxy
 * https://github.com/kessler/json-proxy
 *
 * Copyright (c) 2014 ironSource
 * Licensed under the MIT license.
 */
'use strict';

var StreamSlicer = require('stream-slicer');
var FlowControlStream = require('./FlowControlStream.js');
var HostConcurrencyManager = require('./HostConcurrencyManager');
var backoffAlgorithm = require('./backoffAlgorithm.js');
var urlParser = require('url');
var $u = require('util');
var http = require('http');
var https = require('https');

function JsonProxy(config) {
	this._config = config;
	this._hcm = new HostConcurrencyManager(config.targets);
	this._http = http;
	this._https = https;
	this._maxRetries = config.backoffAlgorithm.maxRetries;
}

JsonProxy.prototype.accept = function(stream, callback) {

	var slicer = this._newSlicer();

	var flowControl = new FlowControlStream();

	slicer.on('slice', this._retransmitFunctor(flowControl));

	stream.pipe(flowControl).pipe(slicer);

	if (callback)
		slicer.on('finish', callback);

	return slicer;
};

JsonProxy.prototype._newSlicer = function() {
	return new StreamSlicer();
};

JsonProxy.prototype._retransmitFunctor = function (stream) {
	var hcm = this._hcm;
	var self = this;

	return function retransmit(slice) {

		// check if there's a host available, _send will occupy() it
		var host = hcm.getAvailable();

		function onHostAvailable() {
			stream.resumeStream();
			self._send(hcm.getAvailable(), slice);
		}

		if (host) {
			self._send(host, slice);
		} else {
			stream.pauseStream();
			hcm.once('host available', onHostAvailable);
		}
	};
};

JsonProxy.prototype._send = function(host, json) {
	var hcm = this._hcm;
	var maxRetries = this._maxRetries;

	// update host concurrency level
	hcm.occupy(host);

	var options = urlParser.parse(host);
	options.method = 'POST';
	options.agent = false;

	var transport;

	if (options.protocol === 'http:') {
		transport = this._http;
	} else if (options.protocol === 'https:') {
		transport = this._https;
	} else {
		throw new Error('invalid protocol for host: ' + host);
	}

	var retries = 0;

	function onRequestError(err) {

		if (retries++ < maxRetries) {
			var nextRetry = backoffAlgorithm.getNextRetry(retries);
			console.warn('%s: failed to upload json to host %s, retrying in %dms (%d/%d retries), error was: %s', new Date(), host, nextRetry, retries, maxRetries, $u.inspect(err));
			setTimeout(sendRequest, nextRetry);

		} else {

			// update host concurrency level
			hcm.release(host);
			console.error('%s: stopping json upload after %d retries to host %s\n%s', new Date(), retries, host, $u.inspect(json));
		}
	}

	function onResponse(response) {
		if (response.statusCode.toString().substr(0, 2) !== '20')
			return onRequestError('status code not ok (' + response.statusCode + ')');

		// update host concurrency level
		hcm.release(host);
	}

	function sendRequest() {

		var request = transport.request(options);

		request.on('error', onRequestError);
		request.on('response', onResponse);
		request.end(json);
	}

	sendRequest();
};


module.exports = JsonProxy;