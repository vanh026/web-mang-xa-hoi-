const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
const Schema = mongoose.Schema;
const vars = require('../../config/vars');
const util = require('util');
const userSchema = new Schema(
	{
		firstName: { type: String, required: true, trim: true },
		lastName: { type: String, required: true, trim: true },
		username: { type: String, required: true, trim: true, unique: true },
		email: { type: String, required: true, trim: true, unique: true },
		password: { type: String, required: true },
		profilePic: { type: String, default: '/images/profilePic.jpeg' },
		coverPhoto: { type: String },
		role: { type: String, default: 'user', enum: ['user', 'admin'] },
		likes: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
		retweets: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
		following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
	},
	{ timestamps: true }
);

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		return next();
	}
	this.password = await CryptoJS.AES.encrypt(
		this.password,
		vars.hash_password_key
	).toString();
	console.log(this.password);
	next();
});

userSchema.methods.isPasswordMatch = async function (password, hashpassword) {
	const decryptPassword = CryptoJS.AES.decrypt(
		hashpassword,
		vars.hash_password_key
	).toString(CryptoJS.enc.Utf8);
	console.log(decryptPassword);
	return decryptPassword === password;
};
var User = mongoose.model('User', userSchema);
module.exports = User;
