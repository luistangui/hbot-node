'use strict'

var request = require("request")

module.exports = 
{
    name : 'news',
    params : 0,
    description : 'Muestra las 3 noticias más relevantes del día',
    command : function(client, from, message, argstr)
    {   
        var url="http://node-hnapi.herokuapp.com/news";
        
        request({url:url,json:true},function (error, response, body)
        {
            if (!error && response.statusCode === 200)
            {
                var news=body;
                news.sort(function(a,b)
                {
                    if(a.points==b.points) return 0;
                    return a.points>b.points?-1:1;
                });
                
                var msg="";
                msg+="\n"+news[0].title+"  <"+news[0].url+">";
                msg+="\n"+news[1].title+"  <"+news[1].url+">";
                msg+="\n"+news[2].title+"  <"+news[2].url+">";
                
                client.sendMessage(from,msg)
            }
        });
    }
}