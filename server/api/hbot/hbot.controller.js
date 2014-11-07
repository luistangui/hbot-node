'use strict';

var _ = require('lodash');
var Hbot = require('./hbot.model');


// Get Roster
exports.roster = function(req, res)
{
  var roster=req.app.stanzaProcessor.getRoster();
  return res.json(200,roster);
};

exports.messages=function(req,res)
{
  var message=req.app.stanzaProcessor.getLastMessage();
  return res.json(200,message);
};

function handleError(res, err) {
  return res.send(500, err);
}