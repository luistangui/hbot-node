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
};

StanzaProcessor.prototype.onBuddy=function(jid, state, statusText)
{
    if(self.roster!=undefined)
    {
        var User=self.getUser(jid);
        if(User) User.state=state;
        
        console.log("BUDDY: "+jid+" -> ("+state+")");
        
        self.roster.sort(function(a,b)
        {
            if(a.state==b.state) return 0;
            
            if(a.state==self.xmppClient.STATUS.OFFLINE ||
                b.state==self.xmppClient.STATUS.OFFLINE)
            {
                return a.state==self.xmppClient.STATUS.OFFLINE?1:-1;
            }
            
            return 0;
        });
        
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

StanzaProcessor.prototype.getUser=function(jid)
{
    for (var i=0,l=self.roster.length; i<l;i++)
    {
        if(self.roster[i].jid==jid) return self.roster[i];
    }
    
    return null;
}

StanzaProcessor.prototype.onChat = function(from, message) 
{
    if(message != null)
    {
        
        var User=self.getUser(from);
        if(User.busy)
        {
            User.busy=false;
            self.saveRoster();
        }
        
        if(message.charAt(0) == "$") 
        {
            var aMsg=message.split(" ");
            var command = aMsg[0].slice(1);
            aMsg.shift();
            var argstr=aMsg;

            if(self.plugins.hasOwnProperty(command) && 
               self.plugins[command].hasOwnProperty("command") &&
               self.plugins[command].params==argstr.length) 
            {
                self.plugins[command].command(self, from, message, argstr);
                
                self.saveRoster();
            }    
        }
        else // Mensaje para todos los users
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
            HBotUserModel.findOne({jid:rosterItem.jid}, function (err, user)
            {
                if (err) console.log(err);
                if(user!=null && user.nick!=rosterItem.nick) 
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
    });
    
    self.io.sockets.emit("xmpp-roster:save",self.roster);
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
                rosterItem.busy=user.busy;
            }
        });

        var user = new HBotUserModel();
    	user.jid = rosterItem.jid;
    	user.nick= rosterItem.jid.substr(0,rosterItem.jid.indexOf('@'));
    	user.save();
    	
    	rosterItem.state=self.xmppClient.STATUS.OFFLINE;
    	
    });
}

StanzaProcessor.prototype.broadcastMessage = function(from,message)
{
    var UserFrom=self.getUser(from);
    
    var brcMessage=UserFrom.nick+": "+message;
    
    //self.io.sockets.emit("xmpp-message:save",self.roster);
    
    
    self.roster.forEach(function(rosterItem)
    {
        if(rosterItem.jid!=from && rosterItem.state!=self.xmppClient.STATUS.OFFLINE && !rosterItem.busy)
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
        if(rosterItem.state!=self.xmppClient.STATUS.OFFLINE && !rosterItem.busy)
        {
            console.log("\""+message+"\""+" -> "+rosterItem.jid);
            self.xmppClient.send(rosterItem.jid,message,false);
        }
    });   
}

StanzaProcessor.prototype.sendMessage=function(to,message)
{
    message="[Claptrap]: "+message;
    console.log("\""+message+"\""+" -> "+to);
    self.xmppClient.send(to,message,false);
}

StanzaProcessor.prototype.getRoster=function()
{
    return self.roster;
}


module.exports = StanzaProcessor;