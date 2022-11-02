const express = require('express');
const path = require('path');
const vars = require('./vars');
//cokie session
const cookieParser = require('cookie-parser');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const logger = require('morgan');

//security
const csrf = require('csurf');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const compress = require('compression');
//router
const { payload } = require('../components/service/render.service');
const authRouter = require('../components/auth/auth.router');
const userRouter = require('../components/users/users.router');
const renderRouter = require('../components/service/render.router');
const postRouter = require('../components/post/post.router');
const chatRouter = require('../components/chat/chat.router');
const messageRouter = require('../components/messages/message.router');
const authController = require('../components/auth/auth.controller');
const app = express();
// view engine setup
app.set('views', path.join(__dirname, '../components/views'));
app.set('view engine', 'pug');
//middleware built in setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../components/public')));
//security
// app.use(csrf({ cookie: true }));
app.use(xss());
app.use(cors());
// const limiter = rateLimit({
// 	windowMs: 15 * 60 * 1000, // 15 minutes
// 	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
// 	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
// 	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// });

// app.use(limiter);
app.use(compress());
//session and cookie
app.use(cookieParser());
app.use(
	session({
		secret: vars.session_key_secret,
		resave: true,
		saveUninitialized: false,
		store: new FileStore({ logFn: function () {} }),
	})
);
//use route
//csrf token
// app.use(function (req, res, next) {
// 	var token = req.csrfToken();
// 	res.cookie('XSRF-TOKEN', token);
// 	res.locals.csrfToken = token;
// 	console.log(token);
// 	next();
// });
app.use('/', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/users', userRouter);
app.use('/api/messages', messageRouter);
app.use('/api/chats', chatRouter);
app.use('/', renderRouter);

app.get('/', authController.verifyUser, (req, res, next) => {
	res.status(200).render('home', payload(req, 'home'));
});

module.exports = app;
