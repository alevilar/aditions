var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');


var net = require('net');
var HOST = 'localhost';
var PORT = 8084;

var WS_PORT = 8085;



app.listen(WS_PORT);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}



net.createServer(function(sock) {
    
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);

    
    // Add a 'data' event handler to this instance of socket
    sock.on('data', function(data) {
        var jdata = JSON.parse(data);

        var tenantIo = io.of('/'+jdata.tenant);
        tenantIo.emit(jdata.event, jdata.msg);
    });

}).listen(PORT, HOST);

console.log('CakePHP Server listening on ' + HOST +':'+ PORT);

console.log('Websocket listening on ' + HOST +':'+ WS_PORT);




