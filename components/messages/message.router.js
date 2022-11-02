const messageController = require('./message.controller');
const router = require('express').Router();

router.post('/', messageController.createMessage);

module.exports = router;
