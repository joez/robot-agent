#!/usr/bin/env node

'use strict';

var debug = require('debug')('robot-agent:app');

var io = require('socket.io-client');
var roslib = require('roslib');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = require('./config/configs');

var ros = new roslib.Ros({ url : config.rosBridge.url });
debug('connecting to robot: '+ config.rosBridge.url);

ros.on('connection', function() {
  debug('robot: connected to server');
});
ros.on('error', function(error) {
  debug('robot: connection error: ' + error);
});
ros.on('close', function() {
  debug('robot: disconnected');
});

var teleop = new (require('./app/controllers/teleop'))(ros);
var photo = require('./app/controllers/photo')(ros);

var socket = io.connect(config.cloudMaster.url);
debug('connecting to cloud: ' + config.cloudMaster.url);

socket.on('connect', function() {
  debug('cloud: connected to server');
});

socket.on('error', function(error) {
  debug('cloud: connection error: ' + error);
});

socket.on('disconnect', function() {
  debug('cloud: disconnected');
});

socket.on('teleop', function(data) {
  debug('teleop: ' + data);
  // TODO: refactor later
  if (teleop.handle(data)) {

  } else if (photo.handle(data, function(message){
    socket.emit('photo', message);
  })) {

  }
});

debug('robot agent started');
