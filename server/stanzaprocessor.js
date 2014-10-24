var ltx=require('ltx');
var self;

function StanzaProcessor(xmppClient) {
    self = this;
    this.xmppClient = xmppClient;
    this.xmppClient.on('online', this.onConnected);
    this.xmppClient.on('error', this.onError);
    this.xmppClient.on('stanza', this.onStanza); 
}

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
    if (stanza.is('message') && (stanza.attrs.type !== 'error'))
    {
        if(stanza.getChildText('body')!=null)
        {
            console.log(stanza.getChildText('body'));
        }
    }
};

module.exports = StanzaProcessor;