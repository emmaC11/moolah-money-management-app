// routes/user.routes.js
import { Router } from 'express';
import auth from '../middleware/authFirebase.js';
import { me, updateMe, upsertMe, getById, updateById, removeById } from '../controllers/user.controller.js';

const router = Router();
router.use(auth);

// Current user
router.get('/me', me);
router.put('/me', updateMe);
// Upsert current user's profile (POST to /users)
router.post('/', upsertMe);

// Admin endpoints (require your admin check inside controller)
router.get('/:uid', getById);
router.put('/:uid', updateById);
router.delete('/:uid', removeById);

export default router;