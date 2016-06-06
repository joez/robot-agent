#!/usr/bin/env node

'use strict';

var io = require('socket.io-client');
var roslib = require('roslib');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = require('./config/configs');

var ros = new roslib.Ros({ url : config.rosBridge.url });
console.log('connecting to ' + config.rosBridge.url);

ros.on('connection', function() {
  console.log('ros: connected to server');
});
ros.on('error', function(error) {
  console.log('ros: connection error: ' + error);
});
ros.on('close', function() {
  console.log('ros: disconnected');
});

var teleop = require('./app/controllers/teleop')(ros);
var photo = require('./app/controllers/photo')(ros);

var socket = io.connect(config.cloudMaster.url);
console.log('connecting to ' + config.cloudMaster.url);

socket.on('connect', function() {
  console.log('connected to server');
});

socket.on('error', function(error) {
  console.log('connection error: ' + error);
});

socket.on('disconnect', function() {
  console.log('disconnected');
});

socket.on('teleop', function(data) {
  console.log('teleop: ' + data);
  // TODO: refactor later
  if (teleop.handle(data)) {

  } else if (photo.handle(data, function(message){
    socket.emit('photo', message);
  })) {

  }
});

console.log('robot agent started');
