const Message = require('./message.model');
const catchAsync = require('../utils/catchAsync');
const Chat = require('../chat/chat.model');
const mongoose = require('mongoose');
const User = require('../users/users.model');
exports.createMessage = catchAsync(async (req, res) => {
	if (!req.body.content || !req.body.chatId) {
		return res.status(400).send('invalid message');
	}
	const messageData = {
		sender: req.session.user._id,
		content: req.body.content,
		chat: req.body.chatId,
	};
	Message.create(messageData)
		.then(async (message) => {
			message = await message.populate('sender');
			message = await message.populate('chat');
			message = await User.populate(message, { path: 'chat.users' });
			const chat = await Chat.findByIdAndUpdate(req.body.chatId, {
				latestMessage: message,
			});
			res.status(201).json(message);
		})
		.catch((error) => {
			console.log(error);
			res.sendStatus(400);
		});
});
