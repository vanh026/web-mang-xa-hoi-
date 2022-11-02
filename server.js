require('dotenv').config();
const vars = require('./config/vars');
const chalk = require('chalk');
const connectDb = require('./config/db');
connectDb();
var app = require('./config/express');

const server = app.listen(vars.port, () => {
	console.log(chalk.red(`server is running....`));
});

const io = require('socket.io')(server, { pingTimeout: 60000 });
io.on('connection', (socket) => {
	socket.on('setup', (userData) => {
		socket.join(userData._id);
		socket.emit('connected');
	});

	socket.on('join room', (room) => socket.join(room)); //join room //on listen //emit send data
	socket.on('typing', (room) => socket.in(room).emit('typing')); //type message
	socket.on('stop typing', (room) => socket.in(room).emit('stop typing')); //stop type messgae
	socket.on('notification received', (room) =>
		socket.in(room).emit('notification received')
	); //add notifi

	socket.on('new message', (newMessage) => {
		//chat new message
		var chat = newMessage.chat;

		if (!chat.users) return console.log('Chat.users not defined');

		chat.users.forEach((user) => {
			if (user._id == newMessage.sender._id) return;
			socket.in(user._id).emit('message received', newMessage);
		});
	});
});
