'use strict';

var debug = require('debug')('robot-agent:teleop');
var roslib = require('roslib');

module.exports = function (ros) {
  return {
    handle : function (cmd, data) {
      var handled = true;

      var speed = 1;

      var getLinearSpeed = function(speed) {
        var base = 0.1; // 0.1 m/s
        return Math.min(2, Math.max(0.1, speed * base));
      }

      var getAngularSpeed = function(speed) {
        var base = 15;  // 15 degrees/s
        return Math.min(180, Math.max(10, speed * base)) * Math.PI / 180;
      }

      // linear x and y movement and angular z movement
      var x = 0;
      var y = 0;
      var z = 0;

      switch (cmd) {
        case 'left':
          z = getAngularSpeed(speed);
          break;
        case 'right':
          z = -getAngularSpeed(speed);
          break;
        case 'up':
          x = getLinearSpeed(speed);
          break;
        case 'down':
          x = -getLinearSpeed(speed);
          break;
        case 'stop':
          break;
        default:
          handled = false;
      }

      if (handled) {
        debug('cmd: ' + cmd + ': ' + x + ', ' + y + ', ' + z);

        var cmdVel = new roslib.Topic({
          ros : ros,
          name : '/cmd_vel_mux/input/navi',
          messageType : 'geometry_msgs/Twist',
          throttle_rate : 500,
          queue_length : 10
        });

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

        cmdVel.publish(twist);
      }

      return handled;
    }
  }
};
