'use strict'

module.exports = {
    name : 'hello',
    params : 0,
    description : 'Hace hablar al bot',
    command : function(client, from, message, argstr)
    {        
        client.sendBotMessage("¿Hay alguna persona de carne y hueso por ahí?");
    }
}