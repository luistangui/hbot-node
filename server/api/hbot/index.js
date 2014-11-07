'use strict';

var express = require('express');
var controller = require('./hbot.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/roster', controller.roster);
router.get('/messages',controller.messages);


module.exports = router;
