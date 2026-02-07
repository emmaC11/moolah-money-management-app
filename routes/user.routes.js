const express = require('express');
const router = express.Router();

const auth = require('../middleware/authFirebase');
const ctrl = require('../controllers/user.controller');
const asyncHandler = require('../utils/asyncHandler');

// All user endpoints require authentication
router.use(auth);

// Current user
router.get('/me',  asyncHandler(ctrl.me));
router.put('/me',  asyncHandler(ctrl.updateMe));
router.post('/',   asyncHandler(ctrl.upsertMe)); // upsert current user's profile

// Admin endpoints (get/update/delete by UID)
router.get('/:uid',    asyncHandler(ctrl.getById));
router.put('/:uid',    asyncHandler(ctrl.updateById));
router.delete('/:uid', asyncHandler(ctrl.removeById));

module.exports = router;