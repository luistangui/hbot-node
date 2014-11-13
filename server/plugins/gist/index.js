'use strict'

module.exports = 
{
    name : 'gist',
    params : 0,
    description : 'Crea un gist y envia la url del código enviado entre [code][/code]',
    command : function(client, from, message, argstr)
    {
        client.sendMessage(from,"Envía código entre [code][/code] para que sea enviado a través de gist");
    },
    
    onMessage: function(client,message,callback)
    {
        var code=message.body.match(/\[code\]([\s\S]*)\[\/code\]/);
        if(code && code[1])
        {
            var GitHubApi = require("github");
            var github = new GitHubApi
            ({
                version: "3.0.0",
                timeout: 5000
            });
            
            github.gists.create
            ({
                "description": "Código enviado a traves de NHBot",
                "public": false,
                "files":
                {
                    "snippet":
                    {
                        "content": code[1]
                    }
                }
            },function(err,rest)
            {
                message.body=message.body.replace("[code]"+code[1]+"[/code]",rest.html_url);
                setTimeout(callback,0);
            });
        }
        else
        {
            setTimeout(callback,0);
        }
    }
}