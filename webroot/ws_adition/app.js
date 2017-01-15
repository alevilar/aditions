var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');


var net = require('net');
var HOST = 'localhost';
var PORT = 8084;

var WS_PORT = 8085;
var APPVERSION = 20170115

app.listen(WS_PORT);

net.createServer( handlerCakePhp ).listen(PORT);

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

function handlerCakePhp( sock ) {
    
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
      
    // Add a 'data' event handler to this instance of socket
    var jsonData = "";
    sock.on('data', function(data) {
        jsonData += data;
    });

    sock.on('end', function(data) {
        var jdata = JSON.parse(jsonData);
        jsonData = "";
        if ( jdata.tenant ) {
          console.log("se enviará data los clientes del tenant "+jdata.tenant);
          io.to(jdata.tenant).emit(jdata.event, jdata.msg);          
        } else {
          console.log("se enviará data a TODOS los clientes");
          io.emit(jdata.event, jdata.msg);
        }
    });
}




io.on('connection', function(socket) {

  console.log("Conectado con Socket de "+socket.nsp.name);
  socket.on('join', function(roomname){
    console.log("se conecto al room "+roomname);
    socket.join(roomname);
  });

  socket.on('disconnect', function(){
    console.log("usuario DESconectado socket io");
  });

  socket.on('reconnect', function(data){
    console.log("usuario reconnect socket io");
    console.log(data);
  });
});


console.log("Version "+APPVERSION+" running...")
console.log('CakePHP Server listening on ' + HOST +':'+ PORT);
console.log('Websocket listening on ' + HOST +':'+ WS_PORT);


