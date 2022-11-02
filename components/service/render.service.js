const Post = require('../post/post.model');
const catchAsync = require('../utils/catchAsync');
const User = require('../users/users.model');
const Chat = require('../chat/chat.model');
const mongoose = require('mongoose');
const payload = (req, title) => {
	return {
		pageTitle: title,
		userLoggedIn: req.session.user,
		userLoggedInJs: JSON.stringify(req.session.user),
	};
};

const renderLogin = (req, res) => {
	res.status(200).render('login', {
		errorMessage: null,
	});
};

const renderRegister = (req, res) => {
	res.status(200).render('register', {
		errorMessage: null,
	});
};
const renderInboxPage = (req, res) => {
	res.status(200).render('inboxPage', payload(req, 'inbox'));
};

const renderNotificationPage = (req, res) => {
	res.status(200).render('notificationsPage', payload(req, 'notifications'));
};
const rendernewMessagePage = (req, res) => {
	res.status(200).render('newMessage', payload(req));
};
const renderPostPage = (req, res) => {
	const postPayload = payload(req, 'View Post');
	postPayload.postId = req.params.postId;
	res.status(200).render('postPage', postPayload);
};
const renderSearchPage = (req, res) => {
	const searchPayload = payload(req, 'Search');
	searchPayload.selectedTab = req.params.selectedTab;
	res.status(200).render('searchPage', searchPayload);
};

const renderProfilePage = catchAsync(async (req, res) => {
	const urlProfile = req.originalUrl;
	const username = req.params.username;
	let selectedTab;
	if (urlProfile.endsWith('replies')) {
		selectedTab = 'replies';
	} else if (urlProfile.endsWith('following')) {
		selectedTab = 'following';
	} else if (urlProfile.endsWith('followers')) {
		selectedTab = 'followers';
	} else {
		selectedTab = 'posts';
	}
	const currentUser = await User.findOne({ username: username });
	const loginUser = req.session.user;
	//check profile of any user
	let user = username ? currentUser : loginUser;
	const profilePayload = payload(req, username);
	profilePayload.profileUser = user;
	profilePayload.selectedTab = selectedTab;
	let pageRender =
		selectedTab === 'replies' || selectedTab === 'posts'
			? 'profilePage'
			: 'followersAndFollowing';
	res.status(200).render(pageRender, profilePayload);
});

const renderChatPage = catchAsync(async (req, res) => {
	const userId = req.session.user._id;
	const chatId = req.params.chatId;
	const isValidId = mongoose.isValidObjectId(chatId);

	const chatPayload = payload(req, 'Chat');
	if (!isValidId) {
		payload.errorMessage =
			'Chat does not exist or you do not have permission to view it.';
		return res.status(200).render('chatPage', payload);
	}
	let chat = await Chat.findOne({
		_id: chatId,
		users: { $elemMatch: { $eq: userId } },
	}).populate('users');
	if (!chat) {
		// Check if chat id is really user id
		const userFound = await User.findById(chatId);

		if (userFound) {
			// get chat using user id
			chat = await getChatByUserId(userFound._id, userId);
			chatPayload.chat = chat;
		}
	}
	chatPayload.chat = chat;
	res.status(200).render('chatPage', chatPayload);
});

function getChatByUserId(userLoggedInId, otherUserId) {
	return Chat.findOneAndUpdate(
		{
			isGroupChat: false,
			users: {
				$size: 2,
				$all: [
					{ $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId) } },
					{ $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) } },
				],
			},
		},
		{
			$setOnInsert: {
				users: [userLoggedInId, otherUserId],
			},
		},
		{
			new: true,
			upsert: true,
		}
	).populate('users');
}

module.exports = {
	payload,
	renderChatPage,
	renderInboxPage,
	renderLogin,
	renderNotificationPage,
	renderPostPage,
	renderProfilePage,
	renderRegister,
	renderSearchPage,
	rendernewMessagePage,
};
