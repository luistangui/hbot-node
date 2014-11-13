'use strict'

module.exports = 
{
    name : 'source',
    params : 0,
    description : 'Muestra la url donde se aloja el código del bot', 
    command : function(client, from, message, argstr)
    {
        client.sendMessage(from,"https://github.com/hzeroo/hbot-node");
    }
}