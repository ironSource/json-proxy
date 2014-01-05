# json-proxy [![Build Status](https://secure.travis-ci.org/ironSource/json-proxy.png?branch=master)](http://travis-ci.org/ironSource/json-proxy)

takes a big http stream of json objects and resends them one by one to one or more destinations

## Install
```
git clone https://github.com/ironSource/json-proxy
cd json-proxy
node proxy-server

// or

node proxy-server --port=8080
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
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/). Run grunt watch while developing.

## Release History
5.1.2014 - initial release

## License
Copyright (c) 2014 ironSource. Licensed under the MIT license.
