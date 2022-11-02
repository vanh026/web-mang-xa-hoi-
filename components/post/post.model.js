const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema(
	{
		content: { type: String, trim: true },
		postedBy: { type: Schema.Types.ObjectId, ref: 'User' },
		pinned: Boolean,
		likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		retweetUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		retweetData: { type: Schema.Types.ObjectId, ref: 'Post' },
		replyTo: { type: Schema.Types.ObjectId, ref: 'Post' },
		pinned: Boolean,
	},
	{ timestamps: true }
);
PostSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'postedBy replyTo',
	});
	next();
});
var Post = mongoose.model('Post', PostSchema);
module.exports = Post;
