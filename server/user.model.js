var mongoose = require('mongoose');


var HBotUser= new mongoose.Schema
({
    jid: { type: String, required: true, unique: true },
    nick: { type: String, required: true },
    busy: { type: Boolean, default: false },
});

var HBotUserModel = mongoose.model('HBotUser', HBotUser);

// Export Models
exports.HBotUserModel = HBotUserModel;