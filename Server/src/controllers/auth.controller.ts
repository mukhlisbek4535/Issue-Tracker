import { Request, Response } from 'express';
import { loginUser, registerUser } from '../services/auth.service';
import { loginSchema, registerSchema } from '../utils/auth.schema';

export const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Invalid request body',
        errors: parsed.error.flatten().fieldErrors,
      });
    }
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({
        message: 'Email, name and password are required',
      });
    }

    const user = await registerUser(email, name, password);

    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'User already exists') {
        return res.status(409).json({ message: error.message });
      }

      console.error('Register error:', error.message);
    } else {
      console.error('Register error:', error);
    }

    res.status(500).json({ message: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Invalid request body',
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const result = await loginUser(email, password);

    res.status(200).json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      console.error('Login error:', error.message);
    } else {
      console.error('Login error:', error);
    }

    res.status(500).json({ message: 'Login failed' });
  }
};
