const postController = require('./post.controller');
const router = require('express').Router();
const { verifyUser } = require('../auth/auth.controller');
router.use(verifyUser);
router.route('/').get(postController.getPost).post(postController.createPost);

router
	.route('/:postId')
	.get(postController.getOnePost)
	.delete(postController.deletePost);
router.put('/:id/like', postController.likePost);
router.put('/:id/retweet', postController.retweetPost);
module.exports = router;
