import pool from '../db';
import { generateToken } from '../utils/jwt';
import { comparePasswords, hashPassword } from '../utils/password';

export const registerUser = async (
  email: string,
  name: string,
  password: string,
) => {
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email],
  );

  if (existingUser.rows.length > 0) {
    throw new Error('User already exists');
  }

  const passwordHash = await hashPassword(password);

  const result = await pool.query(
    `
    INSERT INTO users (email, name, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, email, name, created_at
    `,
    [email, name, passwordHash],
  );

  const user = result.rows[0];

  const token = generateToken({
    id: user.id,
    email: user.email,
  });

  return {
    token,
    user,
  };
};

export const loginUser = async (email: string, password: string) => {
  const result = await pool.query(
    `
    SELECT id, email, name, password_hash
    FROM users
    WHERE email = $1
    `,
    [email],
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid credentials');
  }

  const user = result.rows[0];

  const isPasswordValid = await comparePasswords(password, user.password_hash);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
};
