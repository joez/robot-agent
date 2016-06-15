'use strict';

var debug = require('debug')('robot-agent:photo');
var roslib = require('roslib');

module.exports = function (ros) {
  return {
    handle : function (cmd, cb) {
      var handled = true;

      switch (cmd) {
        case 'shot':
          break;
        default:
          handled = false;
      }

      if (handled) {
        var topic = new roslib.Topic({
          ros : ros,
          name : '/camera/rgb/image_raw/compressed',
          messageType : 'sensor_msgs/CompressedImage',
          throttle_rate : 1000,
          queue_length : 2
        });

        topic.subscribe(function(message) {
          debug("captured a photo with format: " + message.format);
          cb({ type : "image/jpeg", data : message.data});
            topic.unsubscribe();
        });
      }

      return handled;
    }
  }
};
