const jwt = require('jsonwebtoken');
const User = require('../users/users.model');
const util = require('util');

const {
	registerValidation,
	loginValidation,
} = require('../validation/auth.validation');
const catchAsync = require('../utils/catchAsync');

exports.register = catchAsync(async (req, res) => {
	// Validate User
	const { error } = registerValidation(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	// Check if User already in database
	const emailExist = await User.findOne({ email: req.body.email });
	if (emailExist) return res.status(400).send('Email already exists');
	const user = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		password: req.body.password,
		username: req.body.username,
	});
	await user.save();
	req.session.user = user;
	return res.redirect('/');
});

exports.logout = (req, res) => {
	if (req.session) {
		req.session.destroy(() => {
			res.redirect('/login');
		});
	}
};
exports.login = catchAsync(async (req, res, next) => {
	const { error } = loginValidation(req.body);
	if (error) return res.status(400).send(error.details[0].message);
	const { password, email } = req.body;
	const user = await User.findOne({ email });

	if (!user)
		return res.status(404).send({
			status: 'fail',
			message: 'user not exist please register account',
		});
	const isEqual = await user.isPasswordMatch(password, user.password);
	if (!isEqual)
		return res.status(404).send({
			status: 'fail',
			message: 'password not correct',
		});
	req.session.user = user;
	return res.redirect('/');
});
exports.verifyUser = function (req, res, next) {
	if (req.session && req.session.user) {
		return next();
	} else {
		return res.redirect('/login');
	}
};

exports.verifyAdmin = function (req, res, next) {
	if (req.user.role === 'admin') {
		next();
	} else {
		var err = new Error('You are not authorized to perform this operation!');
		return next(err);
	}
};
