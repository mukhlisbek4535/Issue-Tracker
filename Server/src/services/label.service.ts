import pool from '../db';

export const getAllLabels = async () => {
  const query = `
    SELECT id, name, color
    FROM labels
    ORDER BY name ASC;
  `;

  const { rows } = await pool.query(query);
  return rows;
};

export const createLabelService = async (name: string, color: string) => {
  const result = await pool.query(
    `
    INSERT INTO labels (name, color)
    VALUES ($1, $2)
    RETURNING id, name, color;
    `,
    [name, color],
  );

  return result.rows[0];
};

export const deleteLabelService = async (labelId: string) => {
  await pool.query(
    `
    DELETE FROM labels
    WHERE id = $1;
    `,
    [labelId],
  );
};
