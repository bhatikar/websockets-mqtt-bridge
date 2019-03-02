var app = require('http').createServer()
  , io = require('socket.io').listen(app)

app.listen(3000);

var clients = {};

io.sockets.on('connection', function (socket) {
  socket.on('bridge-connect', function(data){
    clients[data.id] = {
      'socket': socket.id,
      'topic': data.topic
    };
	  console.log(clients)
  });

  //Received a publish
  socket.on('publish-message', function(data){
    console.log("Sending: " + data.content + " to " + data.topic);
	  for(var name in clients) {
		  console.log(name)
		  if(clients[name].topic === data.topic) {
			  console.log(clients[name].socket)
			  console.log('found matching sockets topic')
			  //Send to the subscribers
			  io.sockets.connected[clients[name].socket].emit('subscribe-message', {"content":"reply", "topic": data.topic})
		  }
	  }	
  });

  //Removing the socket on disconnect
  socket.on('disconnect', function() {
  	for(var name in clients) {
  		if(clients[name].socket === socket.id) {
  			delete clients[name];
  			break;
  		}
  	}	
  })
});



