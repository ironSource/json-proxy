# json-proxy [![Build Status](https://secure.travis-ci.org/ironSource/json-proxy.png?branch=master)](http://travis-ci.org/ironSource/json-proxy)

takes an http stream of json objects and resends them one by one to one or more destinations

## Install
```
npm install -g json-proxy
jsonproxy --port=8080 --targets."http://localhost:7171"=10 --targets."http://localhost:7272"=10
```

## use programmatically
```
npm install json-proxy
```
```javascript
var http = require('http')
var jsonProxy = require('json-proxy');

// will clone the default config
var config = jsonProxy.config();

// override just what we want
config.targets['http://localhost:7171'] = 10;
config.targets['http://localhost:7272'] = 10;

var proxyServer = new jsonProxy.Server(config)

var httpServer = http.createServer(function(request, response) {

    proxyServer.accept(request, function(err) {
        if (err) {
            response.statusCode = 500
        }

        response.end();
    });

});

httpServer.listen(8282, function () {
    console.log('proxy ready at http://localhost:%s', 8282)
});

```
## Config
create a file called .json-proxyrc in any of the locations specified here: [RC module](https://github.com/dominictarr/rc)
```json
{
	"port": 8181,
	"targets": {
		"http://localhost/": 10
	},
	"backoffAlgorithm": {
		"maxRetries": 10,
		"timeSlot": 1000
	}
}
```
file must pass json validation, such as [jsonlint.com](http://jsonlint.com/)

### port
the port used by the proxy to listen to incoming requests

### targets
you can specify one or more targets here in the form of "url": "concurrency level". The proxy will try its best to send requests based on the concurrency level specified for each url. If the maximum concurrency level is reached for all urls the proxy will transmit backpressure to the incoming stream (hopefully :) )

### backoffAlgorithm
In the event that an outgoing json request fails the proxy will attempt retries using an [exponential backoff algorithm](http://en.wikipedia.org/wiki/Exponential_backoff). Use maxRetries and timeSlot to control the algorithm behaviour. timeSlot is the basic unit which is used to calculate delays between attempts, it is not the exact delay used.

## Contributing
Take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/). Run grunt watch while developing.

## Release History
5.1.2014 - initial release
10.4.2015 - code refresh and publish to npm

## License
Copyright (c) 2014 ironSource. Licensed under the MIT license.
