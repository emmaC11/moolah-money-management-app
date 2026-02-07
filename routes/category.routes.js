const express = require('express');
const router = express.Router();

const auth = require('../middleware/authFirebase');
const ctrl = require('../controllers/category.controller');
const asyncHandler = require('../utils/asyncHandler');

// Protect all category endpoints
router.use(auth);

// RESTful routes
router.get('/',        asyncHandler(ctrl.list));
router.get('/tree',    asyncHandler(ctrl.tree));   // optional hierarchy endpoint
router.get('/:id',     asyncHandler(ctrl.getById));
router.post('/',       asyncHandler(ctrl.create));
router.put('/:id',     asyncHandler(ctrl.update));
router.delete('/:id',  asyncHandler(ctrl.remove));

module.exports = router;