const {
	renderChatPage,
	renderInboxPage,
	renderLogin,
	renderNotificationPage,
	renderPostPage,
	renderProfilePage,
	renderRegister,
	renderSearchPage,
	rendernewMessagePage,
} = require('./render.service');
const { verifyUser } = require('../auth/auth.controller');
const router = require('express').Router();

router.get('/login', renderLogin);
router.get('/register', renderRegister);
router.use(verifyUser);
//post
router.get('/posts/:postId', renderPostPage);
//search

router.get('/search', renderSearchPage);
router.get('/search/:selectedTab', renderSearchPage);
//profile
router.get('/profile', renderProfilePage);
router.get('/profile/:username', renderProfilePage);
router.get('/profile/:username/replies', renderProfilePage);
router.get('/profile/:username/following', renderProfilePage);
router.get('/profile/:username/followers', renderProfilePage);
// router.get('/profile/:selectedTab', renderService.renderProfilePage);
router.get('/notifications', renderNotificationPage);
router.get('/messages', renderInboxPage);
router.get('/messages/new', rendernewMessagePage);
router.get('/messages/:chatId', renderChatPage);
module.exports = router;
