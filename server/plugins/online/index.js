'use strict'

module.exports = 
{
    name : 'online',
    params : 0,
    description : 'Lista los usuarios online',
    command : function(client, from, message, argstr)
    {
        var strUserList="";
        
        client.roster.forEach(function(rosterItem)
        {
            if(rosterItem.state!=client.xmppClient.STATUS.OFFLINE)
            {
                strUserList+="\r\n[+] "+rosterItem.nick+" <"+rosterItem.jid.replace("@","[at]")+">";
            }
        });

        client.sendMessage(from,strUserList);
    }
}