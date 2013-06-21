window.onload = function() {

	var messages = [];
	var socket = io.connect('http://localhost:3000');
	var refresh = document.getElementById("refresh");

	socket.on('message', function (data) {
		if(data.message) {
			messages.push(data);
			var html = '';
			for(var i=0; i<messages.length; i++) {
				html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
				html += messages[i].message + '<br />';
			}
			refresh.innerHTML = html;
		} else {
			console.log("There is a problem:", data);
		}
	});
}