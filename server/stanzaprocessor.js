var ltx=require('ltx');
var EventEmitter = require('events').EventEmitter;
var self;
var HBotUserModel=require('./user.model').HBotUserModel;

function StanzaProcessor(xmppClient,socketio)
{
    self = this;
    this.xmppClient = xmppClient;
    this.events = new EventEmitter();
    this.io=socketio;
    
    require('./pluginloader')(this.onPluginsLoaded);
}

StanzaProcessor.prototype.onPluginsLoaded = function(plugins)
{
    self.plugins = plugins;
    self.setupCallbacks();
};

StanzaProcessor.prototype.setupCallbacks = function()
{
    self.xmppClient.on('online', self.onConnected);
    self.xmppClient.on('error', self.onError);
    self.xmppClient.on('chat', self.onChat);
    self.xmppClient.on('stanza', self.onStanza);
    self.xmppClient.on('buddy', self.onBuddy);
    self.events.on('roster', self.onRoster);
    self.io.on('connection', self.onIoConnection);
};

StanzaProcessor.prototype.onIoConnection=function (socket)
{
    console.log("socket-io connection stanzaprocessor!");
}


StanzaProcessor.prototype.onBuddy=function(jid, state, statusText)
{
    if(self.roster!=undefined)
    {
        self.roster.forEach(function(rosterItem)
        {
            if(rosterItem.jid==jid) rosterItem.state=state;
        });
        
        console.log("BUDDY: "+jid+" -> ("+state+")");
        
        self.io.sockets.emit("xmpp-roster:save",self.roster);
        
        self.saveRoster();
    }
};

StanzaProcessor.prototype.onConnected = function() 
{
    console.log("Connected");
    self.xmppClient.getRoster();

};

StanzaProcessor.prototype.onError = function(err) 
{
    console.error("[ERROR]: "+err);
};

StanzaProcessor.prototype.onChat = function(from, message) 
{
    if(message != null)
    {
        var msgBody = message;
        console.log("msgbody: "+msgBody);
        if(msgBody.charAt(0) == "$") 
        {
            var aMsg=msgBody.split(" ");
            var command = aMsg[0].slice(1);
            
            console.log("cmd: "+command);
            aMsg.shift();
            var argstr=aMsg;
            console.log("argstr: "+argstr);

            if(self.plugins.hasOwnProperty(command) && 
               self.plugins[command].hasOwnProperty("command") &&
               self.plugins[command].params==argstr.length) 
            {
                self.plugins[command].command(self, from, message, argstr);
                
                self.saveRoster();
            }    
        } else // Mensaje para todos los users
        {
            self.broadcastMessage(from,message);   
        }
    }
};

StanzaProcessor.prototype.saveRoster=function()
{
    self.roster.forEach(function(rosterItem)
    {
        if(rosterItem.nick!=undefined)
        {
            HBotUserModel.update({jid:rosterItem.jid},{nick:rosterItem.nick},function(err, nbRow)
            {
					if (err)
					{
						console.log(err);
					}
            });
            
            console.log("Nick updated! "+rosterItem.jid+" -> "+rosterItem.nick);
        }
    });
    
}

StanzaProcessor.prototype.onStanza = function(stanza) {
    if(stanza.is('iq')) {
        if(stanza.attrs.id == "roster_0" && stanza.attrs.type == "result") {
            var query = stanza.getChild("query");
            var xmlItems = query.getChildren("item");
            var roster = [];
            xmlItems.forEach(function(xmlItem) {
                var item = {};
                var attr;
                for (attr in xmlItem.attrs) {
                    item[attr] = xmlItem.attrs[attr];
                }
                roster.push(item);
            });
            self.events.emit('roster', roster);
        }
    }
};

StanzaProcessor.prototype.onRoster = function(roster)
{
    console.log("Roster: \n"+JSON.stringify(roster)+"\n\n");
    
    // Mandando presencia justo despues de obtener el roster, tal como se dice en http://xmpp.org/rfcs/rfc6121.html#roster-login
    self.xmppClient.setPresence("chat", "Soy CL4P-TP, un robot ayudante, ¡pero mis amigos me llaman Claptrap! O lo harían si alguno de ellos siguiera vivo. ¡O si acaso hubiesen existido!");

    self.roster = roster;
    
    self.roster.forEach(function(rosterItem)
    {
        HBotUserModel.findOne({jid:rosterItem.jid}, function (err, user)
        {
            if (err) console.log(err);
            if(user!=null) 
            {
                rosterItem.nick=user.nick;
            }
        });

        var user = new HBotUserModel();
    	user.jid = rosterItem.jid;
    	user.nick= rosterItem.jid.substr(0,rosterItem.jid.indexOf('@'));
    	user.save();
    	
    });
    
    self.requestPresences();
}

StanzaProcessor.prototype.requestPresences=function()
{
    self.roster.forEach(function(rosterItem)
    {
        self.xmppClient.probe(rosterItem.jid,function(state)
        {
            console.log("State: <"+rosterItem.jid+"> ("+rosterItem.state+") -> ("+state+")");
           rosterItem.state=state; 
         });
    });
    
    self.io.sockets.emit("xmpp-roster:save",self.roster);
    //setTimeout(self.requestPresences,5*1000);
}

StanzaProcessor.prototype.broadcastMessage = function(from,message)
{
    var nick=null;

    self.roster.forEach(function(rosterItem)
    {
        if(rosterItem.jid==from)
        {
            nick=rosterItem.nick;
        }
    });
    
    var brcMessage=nick+": "+message;
    
    
    self.roster.forEach(function(rosterItem)
    {
        //TODO: Handle presence
        if(rosterItem.jid!=from)
        {
            console.log("\""+brcMessage+"\""+" -> "+rosterItem.jid);
            self.xmppClient.send(rosterItem.jid,brcMessage,false);
        }
    });
}

StanzaProcessor.prototype.sendBotMessage=function(message)
{
    message="[Claptrap]: "+message;
    self.roster.forEach(function(rosterItem)
    {
        console.log("\""+message+"\""+" -> "+rosterItem.jid);
        self.xmppClient.send(rosterItem.jid,message,false);
    });   
}

StanzaProcessor.prototype.getRoster=function()
{
    return self.roster;
}


module.exports = StanzaProcessor;