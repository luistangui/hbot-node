{"changed":true,"filter":false,"title":"app.js","tooltip":"/server/app.js","value":"'use strict';\n\n// Set default node environment to development\nprocess.env.NODE_ENV = process.env.NODE_ENV || 'development';\n\nvar express = require('express');\nvar mongoose = require('mongoose');\nvar expressConfig = require('./config/environment');\n\n// Connect to database\nmongoose.connect(expressConfig.mongo.uri, expressConfig.mongo.options);\n\nvar HBotUserModel=require('./user.model').HBotUserModel;\n\n// Setup server\nvar app = express();\nvar server = require('http').createServer(app);\nvar socketio = require('socket.io')(server, {\n  serveClient: (expressConfig.env === 'production') ? false : true,\n  path: '/socket.io-client'\n});\napp.io = socketio;\nrequire('./config/socketio')(socketio);\nrequire('./config/express')(app);\nrequire('./routes')(app);\n\n//Connect XMPP\nvar options;\ntry\n{\n    options = require('./config.json');\n}\ncatch(err)\n{\n    throw \"[ERROR]: Cannot open file config.json.\\nINFO: You might need to create a config.json file according to config.example.json template file.\\nShutting down...\\n\"+err;\n}\n\nvar gtalk = require('simple-xmpp');\n\ngtalk.connect(options);\n\ngtalk.conn.connection.socket.setTimeout(0);\ngtalk.conn.connection.socket.setKeepAlive(true, 10000);\nx\n\nvar StanzaProcessor = require('./stanzaprocessor.js');\nvar stanzaProcessor=new StanzaProcessor(gtalk,socketio);\n\napp.stanzaProcessor=stanzaProcessor;\n\n// Start server\nserver.listen(expressConfig.port, expressConfig.ip, function () {\n  console.log('Express server listening on http://128.199.54.247:%d, in %s mode', expressConfig.port, app.get('env'));\n});\n\n\nexports = module.exports = app;\n","undoManager":{"mark":94,"position":95,"stack":[[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":39,"column":23},"end":{"row":40,"column":0}},"text":"\n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":0},"end":{"row":41,"column":0}},"text":"\n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":41,"column":0},"end":{"row":41,"column":26}},"text":"conn.socket.setTimeout(0);"},{"action":"insertText","range":{"start":{"row":41,"column":26},"end":{"row":42,"column":0}},"text":"\n"},{"action":"insertText","range":{"start":{"row":42,"column":0},"end":{"row":42,"column":38}},"text":"conn.socket.setKeepAlive(true, 10000);"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":41,"column":0},"end":{"row":41,"column":5}},"text":"conn."},{"action":"insertText","range":{"start":{"row":41,"column":0},"end":{"row":41,"column":1}},"text":"g"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":41,"column":1},"end":{"row":41,"column":2}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":41,"column":2},"end":{"row":41,"column":3}},"text":"a"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":41,"column":3},"end":{"row":41,"column":4}},"text":"l"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":41,"column":4},"end":{"row":41,"column":5}},"text":"k"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":41,"column":5},"end":{"row":41,"column":6}},"text":"."}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":42,"column":3},"end":{"row":42,"column":4}},"text":"n"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":42,"column":2},"end":{"row":42,"column":3}},"text":"n"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":42,"column":1},"end":{"row":42,"column":2}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":42,"column":0},"end":{"row":42,"column":1}},"text":"c"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":42,"column":0},"end":{"row":42,"column":1}},"text":"g"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":42,"column":1},"end":{"row":42,"column":2}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":42,"column":2},"end":{"row":42,"column":3}},"text":"a"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":42,"column":3},"end":{"row":42,"column":4}},"text":"l"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":42,"column":4},"end":{"row":42,"column":5}},"text":"k"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":42,"column":0},"end":{"row":42,"column":39}},"text":"gtalk.socket.setKeepAlive(true, 10000);"},{"action":"removeLines","range":{"start":{"row":41,"column":0},"end":{"row":42,"column":0}},"nl":"\n","lines":["gtalk.socket.setTimeout(0);"]}]}],[{"group":"doc","deltas":[{"action":"removeLines","range":{"start":{"row":40,"column":0},"end":{"row":41,"column":0}},"nl":"\n","lines":[""]}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":39,"column":23},"end":{"row":40,"column":0}},"text":"\n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":38,"column":0},"end":{"row":39,"column":0}},"text":"\n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":39,"column":0},"end":{"row":39,"column":27}},"text":"gtalk.socket.setTimeout(0);"},{"action":"insertText","range":{"start":{"row":39,"column":27},"end":{"row":40,"column":0}},"text":"\n"},{"action":"insertText","range":{"start":{"row":40,"column":0},"end":{"row":40,"column":39}},"text":"gtalk.socket.setKeepAlive(true, 10000);"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":39},"end":{"row":41,"column":0}},"text":"\n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":39,"column":6},"end":{"row":39,"column":7}},"text":"c"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":39,"column":7},"end":{"row":39,"column":8}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":39,"column":8},"end":{"row":39,"column":9}},"text":"n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":39,"column":9},"end":{"row":39,"column":10}},"text":"n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":39,"column":10},"end":{"row":39,"column":11}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":39,"column":11},"end":{"row":39,"column":12}},"text":"c"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":39,"column":12},"end":{"row":39,"column":13}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":39,"column":13},"end":{"row":39,"column":14}},"text":"i"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":39,"column":14},"end":{"row":39,"column":15}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":39,"column":15},"end":{"row":39,"column":16}},"text":"n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":39,"column":16},"end":{"row":39,"column":17}},"text":"."}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":6},"end":{"row":40,"column":7}},"text":"c"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":7},"end":{"row":40,"column":8}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":8},"end":{"row":40,"column":9}},"text":"n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":9},"end":{"row":40,"column":10}},"text":"n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":10},"end":{"row":40,"column":11}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":11},"end":{"row":40,"column":12}},"text":"c"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":12},"end":{"row":40,"column":13}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":13},"end":{"row":40,"column":14}},"text":"i"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":14},"end":{"row":40,"column":15}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":15},"end":{"row":40,"column":16}},"text":"n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":16},"end":{"row":40,"column":17}},"text":"."}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":0},"end":{"row":43,"column":1}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":1},"end":{"row":43,"column":2}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":2},"end":{"row":43,"column":3}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":3},"end":{"row":43,"column":4}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":4},"end":{"row":43,"column":5}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":5},"end":{"row":43,"column":6}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":6},"end":{"row":43,"column":7}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":7},"end":{"row":43,"column":8}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":8},"end":{"row":43,"column":9}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":9},"end":{"row":43,"column":10}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":10},"end":{"row":43,"column":11}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":11},"end":{"row":43,"column":12}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":12},"end":{"row":43,"column":13}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":13},"end":{"row":43,"column":14}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":14},"end":{"row":43,"column":15}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":15},"end":{"row":43,"column":16}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":16},"end":{"row":43,"column":17}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":17},"end":{"row":43,"column":18}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":18},"end":{"row":43,"column":19}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":19},"end":{"row":43,"column":20}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":43,"column":0},"end":{"row":43,"column":20}},"text":"ssssssssssssssssssss"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":39,"column":10},"end":{"row":39,"column":16}},"text":"ection"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":40,"column":10},"end":{"row":40,"column":16}},"text":"ection"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":39,"column":6},"end":{"row":39,"column":21}},"text":"conn.connection"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":39,"column":21},"end":{"row":39,"column":22}},"text":"c"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":39,"column":21},"end":{"row":39,"column":22}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":39,"column":21},"end":{"row":39,"column":22}},"text":"n"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":39,"column":21},"end":{"row":39,"column":22}},"text":"n"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":40,"column":6},"end":{"row":40,"column":17}},"text":"conn.socket"},{"action":"insertText","range":{"start":{"row":40,"column":6},"end":{"row":40,"column":21}},"text":"conn.connection"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":21},"end":{"row":40,"column":22}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":22},"end":{"row":40,"column":23}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":23},"end":{"row":40,"column":24}},"text":"c"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":24},"end":{"row":40,"column":25}},"text":"k"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":40,"column":24},"end":{"row":40,"column":25}},"text":"k"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":40,"column":23},"end":{"row":40,"column":24}},"text":"c"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":40,"column":22},"end":{"row":40,"column":23}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":40,"column":21},"end":{"row":40,"column":22}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":21},"end":{"row":40,"column":22}},"text":"."}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":22},"end":{"row":40,"column":23}},"text":"s"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":23},"end":{"row":40,"column":24}},"text":"o"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":24},"end":{"row":40,"column":25}},"text":"c"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":25},"end":{"row":40,"column":26}},"text":"k"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":26},"end":{"row":40,"column":27}},"text":"e"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":27},"end":{"row":40,"column":28}},"text":"t"}]}],[{"group":"doc","deltas":[{"action":"removeLines","range":{"start":{"row":39,"column":0},"end":{"row":41,"column":0}},"nl":"\n","lines":["gtalk.conn.connection.socket.setTimeout(0);","gtalk.conn.connection.socket.setKeepAlive(true, 10000);"]}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":40,"column":23},"end":{"row":41,"column":0}},"text":"\n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":41,"column":0},"end":{"row":42,"column":0}},"text":"\n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":42,"column":0},"end":{"row":42,"column":43}},"text":"gtalk.conn.connection.socket.setTimeout(0);"},{"action":"insertText","range":{"start":{"row":42,"column":43},"end":{"row":43,"column":0}},"text":"\n"},{"action":"insertLines","range":{"start":{"row":43,"column":0},"end":{"row":44,"column":0}},"lines":["gtalk.conn.connection.socket.setKeepAlive(true, 10000);"]}]}],[{"group":"doc","deltas":[{"action":"removeText","range":{"start":{"row":37,"column":35},"end":{"row":38,"column":0}},"text":"\n"}]}],[{"group":"doc","deltas":[{"action":"insertText","range":{"start":{"row":43,"column":0},"end":{"row":43,"column":1}},"text":"x"}]}]]},"ace":{"folds":[],"scrolltop":471,"scrollleft":0,"selection":{"start":{"row":43,"column":1},"end":{"row":43,"column":1},"isBackwards":false},"options":{"guessTabSize":true,"useWrapMode":false,"wrapToView":true},"firstLineState":{"row":28,"state":"start","mode":"ace/mode/javascript"}},"timestamp":1415874384229}