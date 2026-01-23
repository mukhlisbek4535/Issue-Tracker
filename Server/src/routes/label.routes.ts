import { Router } from 'express';
import {
  createLabel,
  deleteLabel,
  getLabels,
} from '../controllers/label.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /labels:
 *   get:
 *     summary: Get all labels
 *     description: Returns the list of all available labels.
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of labels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                     example: bug
 *                   color:
 *                     type: string
 *                     example: "#ef4444"
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, getLabels);

/**
 * @swagger
 * /labels:
 *   post:
 *     summary: Create a new label
 *     description: Creates a new label with a unique name.
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *                 example: performance
 *               color:
 *                 type: string
 *                 example: "#f59e0b"
 *     responses:
 *       201:
 *         description: Label created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Label already exists
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, createLabel);

/**
 * @swagger
 * /labels/{id}:
 *   delete:
 *     summary: Delete a label
 *     description: Deletes a label and removes it from all related issues.
 *     tags: [Labels]
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
 *         description: Label deleted successfully
 *       400:
 *         description: Invalid label ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Label not found
 */
router.delete('/:id', authMiddleware, deleteLabel);

export default router;
