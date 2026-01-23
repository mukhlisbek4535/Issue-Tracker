import { Router } from 'express';

import { authMiddleware } from '../middlewares/auth.middleware';
import {
  createComment,
  deleteComment,
  getIssueComments,
} from '../controllers/comment.controller';

const router = Router();

router.post('/issues/:id/comments', authMiddleware, createComment);

router.get('/issues/:id/comments', authMiddleware, getIssueComments);

router.delete('/comments/:id', authMiddleware, deleteComment);

export default router;
