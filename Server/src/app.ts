import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import issueRoutes from './routes/issue.routes';
import labelRoutes from './routes/label.routes';
import authRoutes from './routes/auth.routes';
import commentRoutes from './routes/comment.routes';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

dotenv.config();

const app = express();
app.use(
  cors({
    origin: 'https://issue-tracker-seven-gamma.vercel.app/login',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.options(/.*/, cors());

app.use(express.json());

app.use('/users', userRoutes);
app.use('/issues', issueRoutes);
app.use('/labels', labelRoutes);
app.use('/auth', authRoutes);
app.use('/', commentRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});

export default app;
