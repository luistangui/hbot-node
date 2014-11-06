'use strict'

module.exports = 
{
    name : 'nick',
    params : 1,
    description : 'Cambia el nick que se muestra antes de tus mensajes', 
    command : function(client, from, message, argstr)
    {
        var allowChange=true;
        
        var UserFrom=client.getUser(from);
        var oldNick=UserFrom.nick;
        
        client.roster.forEach(function(rosterItem)
        {
            if(rosterItem.nick==argstr[0]) allowChange=false;
        });
        
        if(allowChange)
        {
            UserFrom.nick=argstr[0];
            client.sendBotMessage(oldNick+" ahora se llama "+UserFrom.nick);
        }

    }
}