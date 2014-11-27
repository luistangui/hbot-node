var EventEmitter = require('events').EventEmitter;
var self;
var HBotUserModel=require('./user.model').HBotUserModel;

function StanzaProcessor(xmppClient,socketio)
{
    self = this;
    this.xmppClient = xmppClient;
    this.events = new EventEmitter();
    this.io=socketio;
    self.lastMsg=null;
    
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
    self.xmppClient.on('close',self.onClose);
    self.xmppClient.on('chat', self.onChat);
    self.xmppClient.on('stanza', self.onStanza);
    self.events.on('roster', self.onRoster);
    self.events.on('presenceChanged',self.onPresenceChanged);
};

StanzaProcessor.prototype.onClose = function()
{
    self.xmppClient.disconnect();
    var options = require('./config.json');
    self.xmppClient.connect(options);
};

StanzaProcessor.prototype.onConnected = function() 
{
    console.log("Connected");
    self.xmppClient.getRoster();

};

StanzaProcessor.prototype.onError = function(err) 
{
    console.error("[ERROR]: "+err);
    self.xmppClient.disconnect();
    var options = require('./config.json');
    self.xmppClient.connect(options);
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
        
        if(message.charAt(0) == "$" || message.charAt(0) == "!") 
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
            var msgObj={};
            msgObj.body=message;
            msgObj.from=from;
            
            var async = require("async");

            var asyncTasks = [];
            
            for(var key in self.plugins)
            {
                if(self.plugins[key].hasOwnProperty("onMessage"))
                {
                    var myFunction=self.plugins[key].onMessage;
                    asyncTasks.push(function(callback)
                    {
                        myFunction(self,msgObj,function()
                        {
                            callback();
                        });
                    });
                }
            }
            
            if(asyncTasks.length>0)
            {
                async.parallel(asyncTasks, function()
                {
                    self.broadcastMessage(msgObj.from,msgObj.body);
                });
            }
            else
            {
                self.broadcastMessage(msgObj.from,msgObj.body);
            }
        }
    }
}

StanzaProcessor.prototype.saveRoster=function()
{
    self.roster.forEach(function(rosterItem)
    {
        if(rosterItem.nick!==undefined)
        {
            HBotUserModel.findOne({jid:rosterItem.jid}, function (err, user)
            {
                if (err) console.log(err);
                if(user!=null && user.nick!=rosterItem.nick) 
                {
                    HBotUserModel.update({jid:rosterItem.jid},{nick:rosterItem.nick,state:rosterItem.state,busy:rosterItem.busy},function(err, nbRow)
                    {
    					if (err)
    					{
    						console.log(err);
    					}
                    });
                }
            });
        }
    });
    
    self.io.sockets.emit("xmpp-roster:save",self.roster);
}

StanzaProcessor.prototype.onStanza = function(stanza)
{
    if(stanza.is('iq'))
    {
        if(stanza.attrs.id == "roster_0" && stanza.attrs.type == "result")
        {
            var query = stanza.getChild("query");
            var xmlItems = query.getChildren("item");
            var roster = [];
            xmlItems.forEach(function(xmlItem)
            {
                var item = {};
                var attr;
                for (attr in xmlItem.attrs)
                {
                    item[attr] = xmlItem.attrs[attr];
                }
                roster.push(item);
            });
            self.events.emit('roster', roster);
        }
    }
    else if(stanza.is('presence'))
    {
        console.log("BUDDY:\n"+stanza);
        var from = stanza.attrs.from;
        
        if(stanza.attrs.type == 'unavailable' || !stanza.attrs.type)
        {
            var jid = from.split('/')[0];
            var resource=from.split('/')[1];
            
            var statusText = stanza.getChildText('status');
            var state = (stanza.getChild('show'))? stanza.getChild('show').getText(): self.xmppClient.STATUS.ONLINE;
            state = (state == 'chat')? self.xmppClient.STATUS.ONLINE : state;
            state = (stanza.attrs.type == 'unavailable')? self.xmppClient.STATUS.OFFLINE : state;
            
            self.events.emit('presenceChanged',jid, resource, state, statusText);
            
        }
    }
};

StanzaProcessor.prototype.onPresenceChanged=function(jid, resource, state, statusText)
{
    if(self.roster!==undefined)
    {
        var User=self.getUser(jid);
        if(User)
        {
            var presence={};
            presence.resource=resource;
            presence.state=state;

            //Si existe el resource actualizamos su estado
            var resourceExists=false;
            User.presences.forEach(function(presence)
            {
                if(presence.resource==resource)
                {
                    presence.state=state;
                    resourceExists=true;
                }
            });
            
            //Si no existe lo añadimos a la lista
            if(!resourceExists)
            {
                User.presences.push(presence);
            }
            
            
            var onlinePresences=User.presences.filter(function(presence)
            {
                return presence.state==self.xmppClient.STATUS.ONLINE;
            });
            
            if(onlinePresences.length>0)
            {
                User.state=self.xmppClient.STATUS.ONLINE;
            }
            else
            {
                User.state=state;    
            }
            
            console.log("BUDDY: "+jid+" -> ("+state+")");
            console.log(User.presences);
            
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
    }
}

StanzaProcessor.prototype.onRoster = function(roster)
{
    console.log("Roster: \n"+JSON.stringify(roster)+"\n\n");
    
    // Mandando presencia justo despues de obtener el roster, tal como se dice en http://xmpp.org/rfcs/rfc6121.html#roster-login
    self.xmppClient.setPresence("chat", "Soy CL4P-TP, un robot ayudante, ¡pero mis amigos me llaman Claptrap! O lo harían si alguno de ellos siguiera vivo. ¡O si acaso hubiesen existido!");

    self.roster = roster;
    
    self.roster.forEach(function(rosterItem)
    {
        rosterItem.state=self.xmppClient.STATUS.OFFLINE;
        
        HBotUserModel.findOne({jid:rosterItem.jid}, function (err, user)
        {
            if (err) console.log(err);
            if(user!=null) 
            {
                rosterItem.nick=user.nick;
                rosterItem.busy=user.busy;
            }
        });
        
        //No tiene efecto si el usuario ya existe
        self.user = new HBotUserModel();
    	self.user.jid = rosterItem.jid;
    	self.user.nick= rosterItem.jid.substr(0,rosterItem.jid.indexOf('@'));
    	self.user.save();
    	
    	rosterItem.presences=[];
    	rosterItem.activeResource=null;
        
        self.xmppClient.probe(rosterItem.jid,function(state)
    	{
            self.saveRoster();
    	});
    });
}

StanzaProcessor.prototype.getLastMessage=function()
{
    return self.lastMsg;
}

StanzaProcessor.prototype.broadcastMessage = function(from,message)
{
    console.log("Broadcast!");
    var UserFrom=self.getUser(from);
    
    var brcMessage=UserFrom.nick+": "+message;
    
    var objMsg={};
    objMsg.nick=UserFrom.nick;
    objMsg.message=message;
    self.lastMsg=objMsg;
    self.io.sockets.emit("xmpp-message:save",objMsg);
    
    
    self.roster.forEach(function(rosterItem)
    {
        if(rosterItem.jid!=from && rosterItem.state!=self.xmppClient.STATUS.OFFLINE && !rosterItem.busy && rosterItem.jid!="bot@h-sec.org")
        {
            setTimeout(function()
            {
                var onlinePresences=rosterItem.presences.filter(function(presence)
                {
                    return presence.state==self.xmppClient.STATUS.ONLINE;
                });
                
                if(onlinePresences.length==1)
                {
                    onlinePresences.forEach(function(presence)
                    {
                        console.log("\""+brcMessage+"\""+" -> "+rosterItem.jid+"/"+presence.resource);
                        self.xmppClient.send(rosterItem.jid+"/"+presence.resource,brcMessage,false);
                    });
                    
                }
                else
                {
                    console.log("\""+brcMessage+"\""+" -> "+rosterItem.jid);
                    self.xmppClient.send(rosterItem.jid,brcMessage,false);
                }
            },300);
        }
    });
}

StanzaProcessor.prototype.sendBotMessage=function(message)
{
    var objMsg={};
    objMsg.nick="[Claptrap]";
    objMsg.message=message;
    self.lastMsg=objMsg;
    self.io.sockets.emit("xmpp-message:save",objMsg);
    
    message="[Claptrap]: "+message;
    
    self.roster.forEach(function(rosterItem)
    {
        if(rosterItem.state!=self.xmppClient.STATUS.OFFLINE && !rosterItem.busy && rosterItem.jid!="bot@h-sec.org")
        {
            setTimeout(function()
            {
                var onlinePresences=rosterItem.presences.filter(function(presence)
                {
                    return presence.state==self.xmppClient.STATUS.ONLINE;
                });
                
                if(onlinePresences.length==1)
                {
                    onlinePresences.forEach(function(presence)
                    {
                        console.log("\""+message+"\""+" -> "+rosterItem.jid+"/"+presence.resource);
                        self.xmppClient.send(rosterItem.jid+"/"+presence.resource,message,false);
                    });
                    
                }
                else
                {
                    console.log("\""+message+"\""+" -> "+rosterItem.jid);
                    self.xmppClient.send(rosterItem.jid,message,false);
                }
            },300);
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