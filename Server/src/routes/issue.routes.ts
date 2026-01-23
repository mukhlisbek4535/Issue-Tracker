import { Router } from 'express';
import {
  createIssue,
  deleteIssue,
  getIssue,
  getIssues,
  updateIssue,
} from '../controllers/issue.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getIssues);
router.get('/:id', authMiddleware, getIssue);
router.post('/', authMiddleware, createIssue);
router.put('/:id', authMiddleware, updateIssue);
router.delete('/:id', authMiddleware, deleteIssue);

export default router;
