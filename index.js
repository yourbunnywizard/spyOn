var express = require('express');
var path = require('path');
var app = express();

var spy = require('./spy');

var server = require('http').createServer(app).listen(process.env.PORT || 8080);
var io = require('socket.io').listen(server);

app.use(express.static('public'));

app.get('/', function(request, response) {
	response.sendFile(__dirname + '/public/index.html');
});

io.sockets.on('connection', function( socket ) {
	console.log('user connected');	
	console.log(io.engine.clientsCount);

	spy.initGame(io, socket);

});

io.sockets.on('disconnect', function( socket ) {
	console.log('user disconnect');	
});