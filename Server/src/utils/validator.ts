import { z } from 'zod';

export const uuidSchema = z.string().uuid();

export const issueStatusSchema = z.enum([
  'todo',
  'in_progress',
  'done',
  'cancelled',
]);

export const issuePrioritySchema = z.enum(['low', 'medium', 'high']);

export const createIssueSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),

  status: issueStatusSchema.optional(),
  priority: issuePrioritySchema.optional(),

  assigneeId: uuidSchema.nullable().optional(),
  labelIds: z.array(uuidSchema).optional(),
});

export const updateIssueSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),

  status: issueStatusSchema.optional(),
  priority: issuePrioritySchema.optional(),

  assigneeId: uuidSchema.nullable().optional(),
  labelIds: z.array(uuidSchema).optional(),
});
