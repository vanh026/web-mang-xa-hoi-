var connected = false;

var socket = io('http://localhost:3003'); //connect socket
socket.emit('setup', userLoggedIn); //setup

socket.on('connected', () => (connected = true)); //connect
socket.on('message received', (newMessage) => messageReceived(newMessage)); //gui tin nhan
//gui thong bao
socket.on('notification received', () => {
	$.get('/api/notifications/latest', (notificationData) => {
		showNotificationPopup(notificationData);
		refreshNotificationsBadge();
	});
});

function emitNotification(userId) {
	if (userId == userLoggedIn._id) return;

	socket.emit('notification received', userId);
}
