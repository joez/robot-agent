'use strict';

var roslib = require('roslib');

module.exports = function (ros) {
  return {
    handle : function (cmd, data) {
      var handled = true;

      // linear x and y movement and angular z movement
      var x = 0;
      var y = 0;
      var z = 0;

      switch (cmd) {
        case 'left':
          z = 1;
          break;
        case 'right':
          z = -1;
          break;
        case 'up':
          x = 0.5;
          break;
        case 'down':
          x = -0.5;
          break;
        case 'stop':
          break;
        default:
          handled = false;
      }

      if (handled) {
        var cmdVel = new roslib.Topic({
          ros : ros,
          name : '/cmd_vel_mux/input/navi',
          messageType : 'geometry_msgs/Twist'
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
