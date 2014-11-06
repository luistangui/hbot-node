'use strict'

module.exports = 
{
    name : 'help',
    params : 0,
    description : 'Muestra este texto de ayuda',
    command : function(client, from, message, argstr)
    {
        var strHelp="";
        
        strHelp+="   ###   NHBot v2   ###   \r\n";
        
        for(var key in client.plugins)
        {
            strHelp+="\r\n!"+key;
            for(var i=0;i<client.plugins[key].params;i++)
            {
                strHelp+=" arg"+i;
            }
            strHelp+=" : "+client.plugins[key].description;
        };

        client.sendMessage(from,strHelp);
    }
}