'use strict'

module.exports = {
    name : 'hello',
    params : 0,
    command : function(client, from, message, argstr)
    {        
        console.log("Comando hello funciona!");
    }
}