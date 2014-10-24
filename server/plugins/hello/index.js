'use strict'

module.exports = {
    name : 'hello',
    command : function(context, stanza, argstr) { // Context tiene al cliente, asi como otra informacion de estado, como usuarios que tienen acceso al bot
        console.log("Comando hello funciona!");
        console.log("Argumentos: "+argstr);
    }
}