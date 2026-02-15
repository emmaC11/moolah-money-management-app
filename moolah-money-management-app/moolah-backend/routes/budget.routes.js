// routes/budget.routes.js
import { Router } from 'express';
import auth from '../middleware/authFirebase.js';
import { list, getById, create, update, remove } from '../controllers/budget.controller.js';

const router = Router();
router.use(auth);

router.get('/', list);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;