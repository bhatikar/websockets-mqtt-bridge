var app = require('http').createServer()
  , io = require('socket.io').listen(app)

app.listen(3000);
const mqtt = require('mqtt')

var clients = {};

io.sockets.on('connection', function (socket) {
	socket.on('bridge-connect', function(data){
		if(clients[data.id] !== undefined)
		{
			console.log('user exists')
			socket.disconnect();
		}
		else
		{
			clients[data.id] = {
				'socket': socket.id,
				'topic': data.topic
			};
		}
		console.log(clients)
  });

  //Received a publish
  socket.on('publish-message', function(data){
    console.log("Sending: " + data.content + " to " + data.topic);
	  client.publish(data.topic, data.content);
	  for(var name in clients) {
		  //console.log(name)
		  //console.log(clients[name].topic)
		  //console.log(data.topic)
		  //console.log(clients[name].socket)
		  //console.log(socket.id)
		  if(clients[name].topic === data.topic && clients[name].socket !== socket.id) {
			  //console.log(clients[name].socket)
			  //console.log('found matching sockets topic')
			  //Send to the subscribers
			  io.sockets.connected[clients[name].socket].emit('subscribe-message', {"content": data.content, "topic": data.topic})
		  }
	  }
  });

  //Removing the socket on disconnect
  socket.on('disconnect', function() {
	console.log('Disconnecting')
  	for(var name in clients) {
  		if(clients[name].socket === socket.id) {
  			delete clients[name];
  			break;
  		}
  	}	
  })
});

var options = {
    port: 1883,
    host: 'mqtt://localhost',
    clientId: 'mqttws_bridge',
    keepalive: 60,
    reconnectPeriod: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clean: true,
    encoding: 'utf8'
};

const client = mqtt.connect('mqtt://localhost', options)

client.on('connect', () => {
    console.log('mqtt client connected');
  client.subscribe('#')
})

client.on('message', (topic, message) => {
	console.log('received message %s %s', topic, message)
	console.log("MQTT to WS Sending: " + message + " to " + topic);
	for(var name in clients) {
		console.log(name)
		if(clients[name].topic === topic) {
			console.log(clients[name].socket)
			console.log('found matching sockets topic')
			//Send to the subscribers
			io.sockets.connected[clients[name].socket].emit('subscribe-message', {"content": message, "topic": topic})
		}
	}
  });
