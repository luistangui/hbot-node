'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var server = require('http').createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: (config.env === 'production') ? false : true,
  path: '/socket.io-client'
});
require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on http://178.62.214.162:%d, in %s mode', config.port, app.get('env'));
});


//TEST :)
var Client = require('node-xmpp-client');
var ltx=require('ltx');

var options;
try {
    options = require('./config.json');
} catch(err) {
    throw "Cannot open file config.json. Shutting down...\n"+err;
}

var gtalk = new Client(options);

gtalk.on('online', function()
{
    console.log("Connected");
    gtalk.send(new ltx.Element('presence', { })
      .c('show').t('chat').up()
      .c('status').t('Happily echoing your <message/> stanzas')
    )
});

gtalk.on('error', function(e) {
    console.log(e);
});

gtalk.on('stanza', function(stanza)
{
    if (stanza.is('message') && (stanza.attrs.type !== 'error'))
    {
        if(stanza.getChildText('body')!=null)
        {
            console.log(stanza.getChildText('body'));
        }
    }
}) 

// Expose app
exports = module.exports = app;