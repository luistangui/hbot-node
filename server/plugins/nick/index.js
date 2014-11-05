'use strict'

module.exports = 
{
    name : 'nick',
    params : 1,
    command : function(client, from, message, argstr)
    {
        console.log("[Comando] !Nick "+argstr);
        
        
        client.roster.forEach(function(rosterItem)
        {
            if(rosterItem.jid==from)
            {
                var oldNick=rosterItem.nick;
                rosterItem.nick=argstr[0];
                client.sendBotMessage(oldNick+" ahora se llama "+rosterItem.nick);
            }
        });

    }
}