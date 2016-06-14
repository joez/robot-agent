var debug = require('debug')('robot-agent:config');

var config = './env/' + process.env.NODE_ENV + '.js';
debug('load configuration: ' + config);

module.exports = require(config);
