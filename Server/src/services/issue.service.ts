import pool from '../db';
import { IssueRow } from '../utils/types';

interface CreateIssueInput {
  title: string;
  description: string;
  status?: string;
  priority?: string;
  assigneeId?: string | null;
  labelIds?: string[];
  createdBy: string;
}

export const getIssueByIdService = async (issueId: string) => {
  const query = `
    SELECT
      i.id,
      i.title,
      i.description,
      i.status,
      i.priority,
      i.created_at,
      i.updated_at,

      i.created_by,
      cu.id AS creator_id,
      cu.name AS creator_name,

      u.id AS assignee_id,
      u.name AS assignee_name,

      l.id AS label_id,
      l.name AS label_name,
      l.color AS label_color

    FROM issues i
    LEFT JOIN users cu ON i.created_by = cu.id
    LEFT JOIN users u ON i.assignee_id = u.id
    LEFT JOIN issue_labels il ON il.issue_id = i.id
    LEFT JOIN labels l ON il.label_id = l.id

    WHERE i.id = $1;
  `;

  const { rows } = await pool.query(query, [issueId]);

  if (rows.length === 0) {
    return null;
  }

  const issues = buildIssues(rows);
  return issues[0];
};

export const getAllIssues = async ({
  page,
  limit,
  search,
  status,
  priority,
  assigneeId,
  labelId,
  sortField = 'updated_at',
  sortDirection = 'desc',
}: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  labelId?: string;
  sortField?: 'updated_at' | 'priority' | 'status';
  sortDirection?: 'asc' | 'desc';
}) => {
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: (number | string)[] = [];
  let idx = 1;

  if (search) {
    conditions.push(`LOWER(i.title) LIKE LOWER($${idx++})`);
    values.push(`%${search}%`);
  }

  if (status) {
    conditions.push(`i.status = $${idx++}`);
    values.push(status);
  }

  if (priority) {
    conditions.push(`i.priority = $${idx++}`);
    values.push(priority);
  }

  if (assigneeId) {
    conditions.push(`i.assignee_id = $${idx++}`);
    values.push(assigneeId);
  }

  if (labelId) {
    conditions.push(`
      EXISTS (
        SELECT 1 FROM issue_labels il
        WHERE il.issue_id = i.id AND il.label_id = $${idx++}
      )
    `);
    values.push(labelId);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT
      i.id,
      i.title,
      i.description,
      i.status,
      i.priority,
      i.created_at,
      i.updated_at,

      i.created_by,
      cu.id AS creator_id,
      cu.name AS creator_name,

      u.id AS assignee_id,
      u.name AS assignee_name,

      l.id AS label_id,
      l.name AS label_name,
      l.color AS label_color

    FROM issues i
    LEFT JOIN users cu ON i.created_by = cu.id
    LEFT JOIN users u ON i.assignee_id = u.id
    LEFT JOIN issue_labels il ON il.issue_id = i.id
    LEFT JOIN labels l ON il.label_id = l.id
    ${whereClause}
    ORDER BY i.${sortField} ${sortDirection}
    LIMIT $${idx++} OFFSET $${idx};
  `;

  const filterValues = [...values];

  values.push(limit, offset);
  const countQuery = `
  SELECT COUNT(DISTINCT i.id) 
  FROM issues i 
  LEFT JOIN issue_labels il ON il.issue_id = i.id 
  ${whereClause}`;

  const [dataResult, countResult] = await Promise.all([
    pool.query(query, values),
    pool.query(countQuery, filterValues),
  ]);

  const total = Number(countResult.rows[0].count);

  return {
    data: buildIssues(dataResult.rows),
    meta: {
      page,
      limit,
      totalIssues: total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const buildIssues = (rows: IssueRow[]) => {
  const issuesMap: Record<
    string,
    {
      id: string;
      title: string;
      description: string;
      status: IssueRow['status'];
      priority: IssueRow['priority'];
      creator: {
        id: string;
        name: string;
      };
      assignee: { id: string; name: string } | null;
      labels: { id: string; name: string; color: string }[];
      createdAt: string;
      updatedAt: string;
    }
  > = {};

  rows.forEach((row) => {
    if (!issuesMap[row.id]) {
      issuesMap[row.id] = {
        id: row.id,
        title: row.title,
        description: row.description,
        status: row.status,
        priority: row.priority,
        creator: {
          id: row.creator_id,
          name: row.creator_name ?? '',
        },
        assignee: row.assignee_id
          ? {
              id: row.assignee_id,
              name: row.assignee_name ?? '',
            }
          : null,
        labels: [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    }

    if (row.label_id) {
      issuesMap[row.id].labels.push({
        id: row.label_id,
        name: row.label_name ?? '',
        color: row.label_color ?? '',
      });
    }
  });

  return Object.values(issuesMap);
};

export const createIssueService = async ({
  title,
  description,
  status = 'todo',
  priority = 'medium',
  assigneeId = null,
  labelIds = [],
  createdBy,
}: CreateIssueInput) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const issueResult = await client.query(
      `
      INSERT INTO issues (title, description, status, priority, assignee_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
      `,
      [title, description, status, priority, assigneeId, createdBy],
    );

    const issueId = issueResult.rows[0].id;

    for (const labelId of labelIds) {
      await client.query(
        `
        INSERT INTO issue_labels (issue_id, label_id)
        VALUES ($1, $2);
        `,
        [issueId, labelId],
      );
    }

    await client.query('COMMIT');

    return {
      id: issueId,
      message: 'Issue created successfully',
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

interface UpdateIssueInput {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assigneeId?: string | null;
  labelIds?: string[];
}

export const updateIssueService = async (
  issueId: string,
  {
    title,
    description,
    status,
    priority,
    assigneeId,
    labelIds = [],
  }: UpdateIssueInput,
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(
      `
      UPDATE issues
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        assignee_id = $5,
        updated_at = NOW()
      WHERE id = $6;
      `,
      [title, description, status, priority, assigneeId, issueId],
    );

    await client.query(`DELETE FROM issue_labels WHERE issue_id = $1`, [
      issueId,
    ]);

    for (const labelId of labelIds) {
      await client.query(
        `
        INSERT INTO issue_labels (issue_id, label_id)
        VALUES ($1, $2);
        `,
        [issueId, labelId],
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const deleteIssueService = async (issueId: string) => {
  await pool.query(
    `
    DELETE FROM issues
    WHERE id = $1;
    `,
    [issueId],
  );
};
