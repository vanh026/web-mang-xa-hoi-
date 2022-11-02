const router = require('express').Router();
const {
	createChat,
	getChat,
	getChatMessages,
	getallChatOfUser,
	updateChatName,
	messageMarkAsRead,
} = require('./chat.controller');
const { verifyUser } = require('../auth/auth.controller');
router.use(verifyUser);
router.post('/', createChat);
router.get('/', getallChatOfUser);
router.get('/:chatId', getChat);
router.get('/:chatId/messages', getChatMessages);
router.put('/:chatId', updateChatName);
router.put('/:chatId/messages/markAsRead', messageMarkAsRead);

module.exports = router;
