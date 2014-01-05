var child = require('child_process');

module.exports = function (what, cwd, args, env) {
	console.log('fork: ', what, cwd, args, env);
	return child.fork(what, process.argv.slice(3).concat(args || []), { cwd: cwd, env: env });
};