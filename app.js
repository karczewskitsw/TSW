/**
 * Module dependencies.
 */

var express = require('express');

var app = express();
// express settings
require('./config/express')(app);

// Bootstrap routes
require('./config/routes')(app);

// Start the app by listening on <port>
var port = 3000;
var server = app.listen(port);
console.log('Express app started on port '+port);

var socketServer = require('./lib/socket_server');
socketServer.listen(server);

// expose app
exports = module.exports = app;