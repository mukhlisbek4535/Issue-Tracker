import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  createCommentService,
  getIssueCommentsService,
  deleteCommentService,
} from '../services/comment.service';

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const issueId = req.params.id;
    const { content } = req.body;
    const userId = req.user!.id;

    if (!content) {
      return res.status(400).json({
        message: 'Comment content is required',
      });
    }

    const comment = await createCommentService(issueId, userId, content);

    return res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to create comment',
    });
  }
};

export const getIssueComments = async (req: AuthRequest, res: Response) => {
  try {
    const issueId = req.params.id;

    const comments = await getIssueCommentsService(issueId);

    return res.json(comments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to fetch comments',
    });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.id;

    await deleteCommentService(commentId);

    return res.json({
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to delete comment',
    });
  }
};
