'use strict';

var debug = require('debug')('robot-agent:door');
var roslib = require('roslib');

module.exports = Door;

function Door(ros) {
  var topic = new roslib.Topic({
    ros : ros,
    name : '/turtlebot_door/door',
    messageType : 'std_msgs/String',
    throttle_rate : 500,
    queue_length : 10
  });

  Object.assign(this, {
    ros : ros,
    topic : topic,
    state : undefined
  });
}

Door.prototype.subscribe = function (cb) {
  if (cb) {
    var fn = (function(message) {
      var state = message.data;
      debug("door state: " + state);
      if (this.state != state) {
        debug('state changed');
        this.state = state;
        cb(state == 'OPEN');
      }
    }).bind(this);

    this.topic.subscribe(fn);
  }
};
