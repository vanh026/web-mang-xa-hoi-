const User = require('./users.model');
const catchAsync = require('../utils/catchAsync');

exports.getUser = catchAsync(async (req, res) => {
	let listUser;
	if (req.query.search) {
		listUser = await User.find({
			$and: [
				{ username: new RegExp(req.query.search, 'i') },
				{ username: { $ne: req.session.user.username } },
			],
		});
	}
	res.status(201).json(listUser);
});
exports.updateFollow = catchAsync(async (req, res) => {
	const userLogginId = req.session.user._id;
	const userId = req.params.userId;
	const user = await User.findById(userId);
	let isFollow =
		user.followers && user.followers.includes(req.session.user._id);
	const option = isFollow ? '$pull' : '$addToSet';

	req.session.user = await User.findByIdAndUpdate(
		userLogginId,
		{
			[option]: {
				following: userId,
			},
		},
		{
			new: true,
		}
	);
	const userFollow = await User.findByIdAndUpdate(
		userId,
		{
			[option]: {
				followers: userLogginId,
			},
		},
		{
			new: true,
		}
	);
	res.status(200).send(req.session.user);
});
exports.getFollow = catchAsync(async (req, res) => {
	const urlFollow = req.originalUrl;
	const userFollowingId = req.params.userId;
	const userFolow = urlFollow.endsWith('following')
		? await User.findById(userFollowingId).populate('following')
		: await User.findById(userFollowingId).populate('followers');

	res.status(200).json(userFolow);
});

exports.uploadProfilePhoto = catchAsync(async (req, res) => {
	console.log(req.file);
	if (!req.file) {
		console.log('No file received');
		return res.send({
			success: false,
		});
	}
	const user = await User.findOneAndUpdate(
		req.session.user._id,
		{ profilePic: `images/${req.file.filename}.png` },
		{ new: true }
	);
	res.status(201).json(user);
});

exports.uploadCoverPhoto = catchAsync(async (req, res) => {
	if (!req.file) {
		console.log('No file received');
		return res.send({
			success: false,
		});
	}
	const user = await User.findOneAndUpdate(
		req.session.user._id,
		{ coverPhoto: `images/${req.file.filename}.png` },
		{ new: true }
	);
	res.status(201).json(user);
});
