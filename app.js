var config = require("nconf");
var express = require('express');
var http = require('http');
var app = express();

config.argv()
    .env()
    .file({ file: 'config.json' });

//boot
require('./boot/index')(app);

// routing
require('./routes/index')(app);

http.createServer(app).listen(app.get('port'), function () {
    if ('development' == app.get('env')) {
        console.log('Express server listening on port ' + app.get('port'));
    }
});
