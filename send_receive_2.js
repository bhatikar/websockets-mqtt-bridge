var io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.emit('bridge-connect', {"topic": "usertopic", "id": "ac"});

  // Send the message to the server
socket.emit("publish-message", {"topic": "usertopic","content": "This is a test message"});

socket.on('subscribe-message', function(data){
	console.log("Received: " + data.content + " to " + data.topic);
});
