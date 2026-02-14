import pool from '../db';

export const getAllUsers = async () => {
  const query = `
    SELECT id, name, email
    FROM users
    ORDER BY name ASC;
  `;

  const { rows } = await pool.query(query);
  return rows;
};
