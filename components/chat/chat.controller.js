const Chat = require('./chat.model');
const catchAsync = require('../utils/catchAsync');
const User = require('../users/users.model');
const Message = require('../messages/message.model');
const createChat = catchAsync(async (req, res) => {
	const arrayUser = req.body.users;
	const users = JSON.parse(arrayUser);
	const chatName = users.length === 1 ? users[0].username : 'Group Chat';
	const isGroupChat = users.length !== 1 ? true : false;
	users.push(req.session.user);
	var chatData = {
		chatName: chatName,
		users: users,
		isGroupChat: isGroupChat,
	};

	const newChat = await Chat.create(chatData);
	res.status(201).json(newChat);
});
const getallChatOfUser = catchAsync(async (req, res) => {
	let results = await Chat.find({
		users: { $elemMatch: { $eq: req.session.user._id } }, //find id in array users type objectid
	})
		.populate('users latestMessage')
		.sort({ updatedAt: -1 });
	if (req.query.unreadOnly !== undefined && req.query.unreadOnly == 'true') {
		results = results.filter(
			(r) =>
				r.latestMessage &&
				!r.latestMessage.readBy.includes(req.session.user._id)
		);
	}

	results = await User.populate(results, { path: 'latestMessage.sender' });
	res.status(200).send(results);
});
const getChatMessages = catchAsync(async (req, res) => {
	const message = await Message.find({ chat: req.params.chatId }).populate(
		'sender'
	);

	res.status(200).json(message);
});
const getChat = catchAsync(async (req, res) => {
	let results = await Chat.findOne({
		_id: req.params.chatId,
		users: { $elemMatch: { $eq: req.session.user._id } },
	}).populate('users');

	res.status(201).json(results);
});
const updateChatName = catchAsync(async (req, res) => {
	const chat = await Chat.findOneAndUpdate(req.params.chatId, req.body, {
		new: true,
	});
	res.status(201).json(chat);
});
const messageMarkAsRead = catchAsync(async (req, res) => {
	const messageRead = await Message.updateMany(
		{ chat: req.params.chatId },
		{ $addToSet: { readBy: req.session.user._id } }
	);
	res.status(201).json(messageRead);
});
module.exports = {
	createChat,
	getChat,
	getChatMessages,
	getallChatOfUser,
	updateChatName,
	messageMarkAsRead,
};
