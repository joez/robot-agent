'use strict';

var debug = require('debug')('robot-agent:teleop');
var roslib = require('roslib');

module.exports = Teleop;

function Teleop(ros) {
  var topic = new roslib.Topic({
    ros : ros,
    name : '/cmd_vel_mux/input/navi',
    messageType : 'geometry_msgs/Twist',
    throttle_rate : 500,
    queue_length : 10
  });

  Object.assign(this, {
    ros : ros,
    topic : topic,
    speed : 1,
    timeline : 0,
    config : {
      hz : 5,
      linear : {
        base : 0.2,
        min : 0.05,
        max : 1
      },
      angular : {
        base : 10,
        min : 5,
        max : 180
      }
    }
  });
};

Teleop.prototype.getSpeed = function (config) {
  return Math.min(config.max, Math.max(config.min, this.speed * config.base));
}

Teleop.prototype.getLinearSpeed = function () {
  return this.getSpeed(this.config.linear);
}

Teleop.prototype.getAngularSpeed = function () {
  return this.getSpeed(this.config.angular);
}

Teleop.prototype.radians = function (degrees) {
  return degrees * Math.PI / 180;
}

Teleop.prototype.done = function () {
  var self = this;

  debug('done: timeline ' + self.timeline + 'ms');

  setTimeout(() => {
    self.timeline = 0;
    debug('done: finished, timeline is reset');
  }, self.timeline);

  return self;
}

Teleop.prototype.moveForMeters = function (meters) {
  var self = this;

  var reverse = meters < 0;
  meters = Math.abs(meters);

  var twist = self.genTwistMessage(reverse ? 'down' : 'up');
  var speed = self.getLinearSpeed();
  var duration = meters / speed * 1000;

  var tick = function () {
    self.topic.publish(twist);
  };

  debug('moveForMeters: ' + meters + ' with speed ' + speed + 'm/s , duration ' + duration + 's');

  return self.repeatForDuration(tick, duration);
}

Teleop.prototype.turnForDegrees = function (degrees, speed, next) {
  var self = this;

  var reverse = degrees < 0;
  degrees = Math.abs(degrees);

  var twist = self.genTwistMessage(reverse ? 'right' : 'left');
  var speed = self.getAngularSpeed();
  var duration = degrees / speed * 1000;

  var tick = function () {
    self.topic.publish(twist);
  };

  debug('turnForDegrees: ' + degrees + ' with speed ' + speed + 'm/s , duration ' + duration + 's');

  return self.repeatForDuration(tick, duration);
}

Teleop.prototype.repeatForDuration = function (tick, duration) {
  var step = 1000 / this.config.hz; // in ms

  for (var i = 0; i < duration; i += step) {
    setTimeout(tick, this.timeline);
    this.timeline += step;
  }

  return this;
}

Teleop.prototype.genTwistMessage = function (move) {
  // linear x and y movement and angular z movement
  var x = 0;
  var y = 0;
  var z = 0;

  switch (move) {
    case 'left':
      z = this.radians(this.getAngularSpeed());
      break;
    case 'right':
      z = -this.radians(this.getAngularSpeed());
      break;
    case 'up':
      x = this.getLinearSpeed();
      break;
    case 'down':
      x = -this.getLinearSpeed();
      break;
    case 'stop':
      break;
    default:
  }

  debug('twist: ' + '(x,y,z)=' + x + ',' + y + ',' + z);

  var twist = new roslib.Message({
    angular : {
      x : 0,
      y : 0,
      z : z
    },
    linear : {
      x : x,
      y : y,
      z : z
    }
  });

  return twist;
}

Teleop.prototype.handle = function (cmd, data) {
  var handled = true;

  switch (cmd) {
    case 'left':
    case 'right':
    case 'up':
    case 'down':
    case 'stop':
      this.topic.publish(this.genTwistMessage(cmd));
      break;
    case 'demo':
      this.moveForMeters(1).turnForDegrees(90)
        .moveForMeters(1).turnForDegrees(90)
        .moveForMeters(1).turnForDegrees(90)
        .moveForMeters(1).turnForDegrees(90)
        .done();
      break;
    default:
      handled = false;
  }

  if (handled) {
    debug('cmd: ' + cmd);
  }

  return handled;
};
