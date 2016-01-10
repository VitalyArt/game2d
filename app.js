var PORT = process.env.PORT || 80;

var clients = {};
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
    client.on('server plane update', function (message) {
        data = {
            id: client.id,
            name: clients[client.id],
            speed: message.speed,
            angle: message.angle,
            x: message.x,
            y: message.y,
            width: message.width,
            height: message.height
        };
        client.broadcast.emit('client plane update', data);
    });
    client.on('server player login', function (name) {
        clients[client.id] = name;
        client.emit('client player login', client.id);
        console.log('Client "' + name + '" connected.');
    });
    client.on('server bullet update', function (bullet) {
        client.broadcast.emit('client bullet update', bullet);
    });
    client.on('server plane explode', function (id) {
        client.broadcast.emit('client plane explode', id);
        console.log('Client "' + clients[id] + '" exploded.');
        delete clients[id];
    });
    client.on('disconnect', function () {
        client.broadcast.emit('client plane delete', client.id);
        console.log('Client "' + clients[client.id] + '" disconnected.');
        delete clients[client.id];
    });
});

console.log('Listen ' + PORT + ' port');