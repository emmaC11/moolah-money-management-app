// routes/transaction.routes.js
import { Router } from 'express';
import auth from '../middleware/authFirebase.js';
import { list, create } from '../controllers/transaction.controller.js';

const router = Router();
router.use(auth);

router.get('/', list);
router.post('/', create);

export default router;