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

/**
 * @swagger
 * /issues:
 *   get:
 *     summary: Get paginated list of issues
 *     description: Retrieve issues with filtering, sorting and pagination.
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: login
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, done, cancelled]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *       - in: query
 *         name: assigneeId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: labelId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: sortField
 *         schema:
 *           type: string
 *           enum: [updated_at, priority, status]
 *       - in: query
 *         name: sortDirection
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Paginated list of issues
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, getIssues);

/**
 * @swagger
 * /issues/{id}:
 *   get:
 *     summary: Get issue by ID
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Issue details
 *       400:
 *         description: Invalid issue ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Issue not found
 */
router.get('/:id', authMiddleware, getIssue);

/**
 * @swagger
 * /issues:
 *   post:
 *     summary: Create a new issue
 *     description: The issue creator is inferred from the authenticated user.
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: Fix login validation
 *               description:
 *                 type: string
 *                 example: Login page fails on empty input
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done, cancelled]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               assigneeId:
 *                 type: string
 *                 format: uuid
 *               labelIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Issue created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, createIssue);

/**
 * @swagger
 * /issues/{id}:
 *   put:
 *     summary: Update an existing issue
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done, cancelled]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               assigneeId:
 *                 type: string
 *                 format: uuid
 *               labelIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Issue updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Issue not found
 */
router.put('/:id', authMiddleware, updateIssue);

/**
 * @swagger
 * /issues/{id}:
 *   delete:
 *     summary: Delete an issue
 *     description: Deletes the issue and all related comments and labels.
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Issue deleted successfully
 *       400:
 *         description: Invalid issue ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Issue not found
 */
router.delete('/:id', authMiddleware, deleteIssue);

export default router;
