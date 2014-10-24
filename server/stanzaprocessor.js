var ltx=require('ltx');
var self;

function StanzaProcessor(xmppClient) {
    self = this;
    this.xmppClient = xmppClient;
    
    require('./pluginloader')(this.onPluginsLoaded);
}

StanzaProcessor.prototype.onPluginsLoaded = function(plugins) {
    self.plugins = plugins;
    self.setupCallbacks();
};

StanzaProcessor.prototype.setupCallbacks = function() {
    self.xmppClient.on('online', self.onConnected);
    self.xmppClient.on('error', self.onError);
    self.xmppClient.on('stanza', self.onStanza);    
};

StanzaProcessor.prototype.onConnected = function() 
{
    console.log("Connected");
    self.xmppClient.send(
        new ltx.Element('presence', { })
          .c('show').t('chat').up()
          .c('status').t('Happily echoing your <message/> stanzas')
    );
};

StanzaProcessor.prototype.onError = function(err) 
{
    console.error("[ERROR]: "+err);
};

StanzaProcessor.prototype.onStanza = function(stanza) 
{
    if (stanza.is('message') && (stanza.attrs.type == 'chat'))
    {
        if(stanza.getChildText('body')!=null)
        {
            var msgBody = stanza.getChildText('body'); 
            console.log("msgbody: "+msgBody);
            if(msgBody.charAt(0) == "$") 
            {
                var end = msgBody.indexOf(" ");
                if(end == -1) end = msgBody.length;
                var command = msgBody.substr(1, end-1);
                console.log("cmd: "+command);
                var argstr;
                if(end != msgBody.length) {
                    argstr = msgBody.substr(end+1);
                }
                if(self.plugins.hasOwnProperty(command) && 
                   self.plugins[command].hasOwnProperty("command")) 
                {
                    self.plugins[command].command(self, stanza, argstr);
                }    
            }
        }
    }
};

module.exports = StanzaProcessor;