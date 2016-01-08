var PORT = 80;

var clients = [];
var options = {
//    'log level': 0
};

var express = require('express');
var http = require('http');

var app = express();
var server = http.createServer(app).listen(PORT);
var io = require('socket.io').listen(server, options);

app.use('/', express.static(__dirname + '/static'));

io.sockets.on('connection', function (client) { 
    client.on('updateServer', function (message) {
        data = {
            id: client.id,
            name: clients[client.id],
            speed: 256, // movement in pixels per second
            angle: message.angle,
            x: message.x,
            y: message.y,
            width: message.width,
            height: message.height
        };
        client.broadcast.emit('updateClient', data);
    });
    
    client.on('auth', function (name) {
        clients[client.id] = name;
        client.emit('auth', client.id);
        console.log('Client "' + name + '" connected.');
    });
    client.on('disconnect', function () {
        client.broadcast.emit('delPlane', client.id);
        console.log('Client "' + clients[client.id] + '" disconnected.');
        delete clients[client.id];
    });
});

console.log('Listen ' + PORT + ' port');