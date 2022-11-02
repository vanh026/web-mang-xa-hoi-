const router = require('express').Router();
const userController = require('./users.controller');
const { verifyUser } = require('../auth/auth.controller');
const multer = require('multer');
const upload = multer({ dest: 'components/public/images/' });
router.use(verifyUser);
router.get('/', userController.getUser);
router.put('/:userId/follow', userController.updateFollow);
router.get('/:userId/following', userController.getFollow);
router.get('/:userId/followers', userController.getFollow);
router.post(
	'/profilePicture',
	upload.single('croppedImage'),
	userController.uploadProfilePhoto
);
router.post(
	'/coverPhoto',
	upload.single('croppedImage'),
	userController.uploadCoverPhoto
);
module.exports = router;
