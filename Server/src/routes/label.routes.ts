import { Router } from 'express';
import {
  createLabel,
  deleteLabel,
  getLabels,
} from '../controllers/label.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getLabels);
router.post('/', authMiddleware, createLabel);
router.delete('/:id', authMiddleware, deleteLabel);

export default router;
