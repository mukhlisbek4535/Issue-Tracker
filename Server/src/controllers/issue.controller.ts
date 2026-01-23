import { Request, Response } from 'express';
import {
  createIssueService,
  deleteIssueService,
  getAllIssues,
  getIssueByIdService,
  updateIssueService,
} from '../services/issue.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createIssueSchema, updateIssueSchema } from '../utils/validator';
import { idParamSchema } from '../utils/common.schema';
import { z } from 'zod';

export const getIssue = async (req: Request, res: Response) => {
  try {
    const issueId = req.params.id;

    const issue = await getIssueByIdService(issueId);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    return res.status(200).json(issue);
  } catch (error) {
    console.error('Error fetching issue:', error);
    return res.status(500).json({ message: 'Failed to fetch issue' });
  }
};

export const getIssues = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        message: 'Invalid pagination parameters',
      });
    }

    const sortField =
      req.query.sortField === 'updated_at' ||
      req.query.sortField === 'priority' ||
      req.query.sortField === 'status'
        ? req.query.sortField
        : undefined;

    const sortDirection = req.query.sortDirection === 'asc' ? 'asc' : 'desc';

    const result = await getAllIssues({
      page,
      limit,
      search: req.query.search as string,
      status: req.query.status as string,
      priority: req.query.priority as string,
      assigneeId: req.query.assigneeId as string,
      labelId: req.query.labelId as string,
      sortField: sortField,
      sortDirection: sortDirection,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ message: 'Failed to fetch issues' });
  }
};

export const createIssue = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createIssueSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Invalid request body',
        errors: parsed.error.format(), // predictable & structured
      });
    }

    const { title, description, status, priority, assigneeId, labelIds } =
      req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: 'Title and description are required',
      });
    }

    const userId = req.user!.id;

    const issue = await createIssueService({
      title,
      description,
      status,
      priority,
      assigneeId,
      labelIds,
      createdBy: userId,
    });

    return res.status(201).json(issue);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to create issue',
    });
  }
};

export const updateIssue = async (req: AuthRequest, res: Response) => {
  try {
    const paramCheck = idParamSchema.safeParse(req.params);
    if (!paramCheck.success) {
      return res.status(400).json({ message: 'Invalid issue id' });
    }
    const issueId = req.params.id;

    const parsed = updateIssueSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Invalid request body',
        errors: z.treeifyError(parsed.error),
      });
    }

    const { title, description, status, priority, assigneeId, labelIds } =
      req.body;

    await updateIssueService(issueId, {
      title,
      description,
      status,
      priority,
      assigneeId,
      labelIds,
    });

    return res.json({
      message: 'Issue updated successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to update issue',
    });
  }
};

export const deleteIssue = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = idParamSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid issue id' });
    }

    const issueId = req.params.id;

    await deleteIssueService(issueId);

    return res.json({
      message: 'Issue deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Failed to delete issue',
    });
  }
};
