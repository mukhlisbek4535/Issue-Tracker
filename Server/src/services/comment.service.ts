import pool from '../db';

export const createCommentService = async (
  issueId: string,
  userId: string,
  content: string,
) => {
  const result = await pool.query(
    `
    INSERT INTO comments (issue_id, user_id, content)
    VALUES ($1, $2, $3)
    RETURNING id, content, created_at;
    `,
    [issueId, userId, content],
  );

  return result.rows[0];
};

export const getIssueCommentsService = async (issueId: string) => {
  const result = await pool.query(
    `
    SELECT
      c.id,
      c.content,
      c.created_at,
      u.id AS user_id,
      u.name AS user_name
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.issue_id = $1
    ORDER BY c.created_at ASC;
    `,
    [issueId],
  );

  return result.rows.map((row) => ({
    id: row.id,
    content: row.content,
    createdAt: row.created_at,
    author: row.user_id ? { id: row.user_id, name: row.user_name } : null,
  }));
};

export const deleteCommentService = async (commentId: string) => {
  await pool.query(
    `
    DELETE FROM comments
    WHERE id = $1;
    `,
    [commentId],
  );
};
