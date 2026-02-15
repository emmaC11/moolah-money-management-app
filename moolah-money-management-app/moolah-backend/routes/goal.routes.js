const express = require('express');
const router = express.Router();

const auth = require('../middleware/authFirebase');
const ctrl = require('../controllers/goal.controller');
const asyncHandler = require('../utils/asyncHandler');

// Protect all goal endpoints
router.use(auth);

// RESTful routes
router.get('/',       asyncHandler(ctrl.list));
router.get('/:id',    asyncHandler(ctrl.getById));
router.post('/',      asyncHandler(ctrl.create));
router.put('/:id',    asyncHandler(ctrl.update));
router.delete('/:id', asyncHandler(ctrl.remove));

module.exports = router;