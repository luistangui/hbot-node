'use strict'

module.exports = 
{
    name : 'busy',
    params : 0,
    description : 'Te pone ausente, no recibirás mensajes hasta que vuelvas a hablar',
    command : function(client, from, message, argstr)
    {
        var user=null;
        client.roster.forEach(function(rosterItem)
        {
            if(rosterItem.jid==from)
            {
                user=rosterItem;
            }
        });
        
        user.busy=true;
        client.sendBotMessage(user.nick+" está ahora ausente");
    }
}