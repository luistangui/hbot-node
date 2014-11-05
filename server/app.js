'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var expressConfig = require('./config/environment');

// Connect to database
mongoose.connect(expressConfig.mongo.uri, expressConfig.mongo.options);

var HBotUserModel=require('./user.model').HBotUserModel;

// Setup server
var app = express();
var server = require('http').createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: (expressConfig.env === 'production') ? false : true,
  path: '/socket.io-client'
});
app.io = socketio;
require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

//Connect XMPP
var options;
try
{
    options = require('./config.json');
}
catch(err)
{
    throw "[ERROR]: Cannot open file config.json.\nINFO: You might need to create a config.json file according to config.example.json template file.\nShutting down...\n"+err;
}

var gtalk = require('simple-xmpp');

gtalk.connect(options);

var StanzaProcessor = require('./stanzaprocessor.js');
var stanzaProcessor=new StanzaProcessor(gtalk,socketio);

app.stanzaProcessor=stanzaProcessor;

// Start server
server.listen(expressConfig.port, expressConfig.ip, function () {
  console.log('Express server listening on http://128.199.54.247:%d, in %s mode', expressConfig.port, app.get('env'));
});


exports = module.exports = app;
