var config = './env/' + process.env.NODE_ENV + '.js';
console.log('load configuration: ' + config);

module.exports = require(config);
