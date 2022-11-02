const Post = require('./post.model');
const catchAsync = require('../utils/catchAsync');
const User = require('../users/users.model');
exports.createPost = catchAsync(async (req, res) => {
	const newPost = {
		content: req.body.content,
		postedBy: req.session.user,
	};
	if (req.body.replyTo) {
		newPost.replyTo = req.body.replyTo;
	}
	let post = await Post.create(newPost);

	const postId = await Post.findById(post._id);
	res.status(201).json(postId);
});
exports.getPost = catchAsync(async (req, res) => {
	const user = await User.findById(req.session.user._id);
	let listPost = [];
	if (req.query.search) {
		listPost = await Post.find({ content: new RegExp(req.query.search, 'i') });
	}
	if (req.query.isReply != undefined) {
		listPost = await Post.find({ postedBy: req.query.postedBy });
	}

	if (req.query.followingOnly) {
		listPost = await Post.find({
			$or: [
				{ postedBy: req.session.user._id },
				{ postedBy: { $in: user.following } },
			],
		});
	}

	res.status(201).json(listPost);
});
exports.deletePost = catchAsync(async (req, res) => {
	const deletePost = await Post.findByIdAndDelete(req.params.postId);
	res.status(202).send({
		status: 'success',
		deletePost,
	});
});
exports.getOnePost = catchAsync(async (req, res) => {
	var postId = req.params.postId;

	var postData = await getPosts({ _id: postId });
	postData = postData[0];

	var results = {
		postData: postData,
	};

	if (postData.replyTo !== undefined) {
		results.replyTo = postData.replyTo;
	}

	results.replies = await getPosts({ replyTo: postId });

	res.status(200).send(results);
});
exports.likePost = catchAsync(async (req, res) => {
	// let post = await Post.findOneAndUpdate(
	// 	{
	// 		_id: req.params.id,
	// 	},
	// 	{ $push: { likes: req.session.user._id } }
	// ); // or whatever.
	// let user = await User.findOneAndUpdate(
	// 	{
	// 		_id: req.session.user._id,
	// 	},
	// 	{ $push: { likes: req.params.id } }
	// ); // or whatever.
	// numberCount++;
	// console.log(numberCount);
	// if (numberCount % 2 === 0) {
	// 	post = await Post.findOneAndUpdate(
	// 		{
	// 			_id: req.params.id,
	// 		},
	// 		{ $pull: { likes: req.session.user._id } }
	// 	);
	// 	user = await User.findOneAndUpdate(
	// 		{
	// 			_id: req.session.user._id,
	// 		},
	// 		{ $pull: { likes: req.params._id } }
	// 	);
	// }
	var postId = req.params.id;
	var userId = req.session.user._id;
	var isLiked =
		req.session.user.likes && req.session.user.likes.includes(postId);

	var option = isLiked ? '$pull' : '$addToSet';

	// Insert user like
	req.session.user = await User.findByIdAndUpdate(
		userId,
		{ [option]: { likes: postId } },
		{ new: true }
	);

	// Insert post like
	var post = await Post.findByIdAndUpdate(
		postId,
		{ [option]: { likes: userId } },
		{ new: true }
	);

	res.status(201).json(post);
});
exports.retweetPost = catchAsync(async (req, res) => {
	var postId = req.params.id;
	var userId = req.session.user._id;
	var isRetweet =
		req.session.user.retweets && req.session.user.retweets.includes(postId);
	var option = isRetweet ? '$pull' : '$addToSet';
	req.session.user = await User.findByIdAndUpdate(
		userId,
		{ [option]: { retweets: postId } },
		{ new: true }
	);

	// Insert post like
	var post = await Post.findByIdAndUpdate(
		postId,
		{ [option]: { retweetUsers: userId, retweetData: postId } },
		{ new: true }
	);
	res.status(201).json(post);
});
async function getPosts(filter) {
	var results = await Post.find(filter)
		.populate('postedBy')
		.populate('retweetData')
		.populate('replyTo')
		.sort({ createdAt: -1 })
		.catch((error) => console.log(error));

	results = await User.populate(results, { path: 'replyTo.postedBy' });
	return await User.populate(results, { path: 'retweetData.postedBy' });
}
