import { Router } from 'express';

import { authMiddleware } from '../middlewares/auth.middleware';
import {
  createComment,
  deleteComment,
  getIssueComments,
} from '../controllers/comment.controller';

const router = Router();

/**
 * @swagger
 * /issues/{id}/comments:
 *   post:
 *     summary: Add a comment to an issue
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Issue ID
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: This issue is caused by a missing validation
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Issue not found
 * */
router.post('/issues/:id/comments', authMiddleware, createComment);

/**
 * @swagger
 * /issues/{id}/comments:
 *   get:
 *     summary: Get all comments for an issue
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Issue ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of comments for the issue
 *       404:
 *         description: Issue not found
 */
router.get('/issues/:id/comments', authMiddleware, getIssueComments);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Comment ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 */
router.delete('/comments/:id', authMiddleware, deleteComment);

export default router;
