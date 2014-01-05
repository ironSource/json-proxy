var util = require('util');
var Transform = require('stream').Transform;
var EventEmitter = require('events').EventEmitter;

module.exports = FlowControlStream;

util.inherits(FlowControlStream, Transform);
function FlowControlStream(options) {
	Transform.call(this, options);

	this._paused = false;
	this._emitter = new EventEmitter();
}

FlowControlStream.prototype.pauseStream = function () {
	this._paused = true;
};

FlowControlStream.prototype.resumeStream = function () {
	this._paused = false;
	this._emitter.emit('resumed');
};

FlowControlStream.prototype._transform = function(chunk, encoding, callback) {

	if (this._paused) {

		this._emitter.once('resumed', function () {
			callback(null, chunk);
		});

	} else {
		return callback(null, chunk);
	}
};
