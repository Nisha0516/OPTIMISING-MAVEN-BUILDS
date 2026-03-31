const express = require('express');
const router = express.Router();
const {
  getMessages,
  getMessage,
  sendMessage,
  markAsRead,
  deleteMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getMessages)
  .post(sendMessage);

router.route('/:id')
  .get(getMessage)
  .delete(deleteMessage);

router.put('/:id/read', markAsRead);

module.exports = router;
