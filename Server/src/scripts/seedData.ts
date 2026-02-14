import pool from '../db';

const seedData = async () => {
  try {
    await pool.query(`
    INSERT INTO users (email, name, password_hash)
    VALUES
    ('john@test.com', 'John Doe', 'hashed'),
    ('jane@test.com', 'Jane Smith', 'hashed');
`);

    await pool.query(`
    INSERT INTO labels (name, color)
    VALUES
    ('bug', '#ef4444'),
    ('feature', '#3b82f6'),
    ('performance', '#f59e0b');
`);

    await pool.query(`
    INSERT INTO issues (title, description, status, priority, assignee_id, created_by)
    VALUES
    (
      'Fix login page validation',
      'Login fails on invalid input',
      'todo',
      'high',
      (SELECT id FROM users WHERE email = 'john@test.com'),
      (SELECT id FROM users WHERE email = 'jane@test.com')
    ),
    (
      'Performance optimization',
      'Improve page load speed',
      'in_progress',
      'high',
      (SELECT id FROM users WHERE email = 'john@test.com'),
      (SELECT id FROM users WHERE email = 'jane@test.com')
    ),
    (
      'Add dark mode support',
      'Add dark theme',
      'in_progress',
      'medium',
      (SELECT id FROM users WHERE email = 'jane@test.com'),
      (SELECT id FROM users WHERE email = 'john@test.com')
    ),
    (
      'Fix mobile responsiveness',
      'UI breaks on small screens',
      'done',
      'medium',
      NULL,
      (SELECT id FROM users WHERE email = 'jane@test.com')
    ),
    (
      'Fix login page and registration page validation',
      '...', 
      'done', 
      'high',
      (SELECT id FROM users WHERE email='john@test.com'),
      (SELECT id FROM users WHERE email = 'jane@test.com')
    ),

  (
    'Performance optimization', 
    '...', 
    'cancelled', 
    'high',
    (SELECT id FROM users WHERE email='john@test.com'),
    (SELECT id FROM users WHERE email = 'jane@test.com')
    ),

  (
    'Add dark mode support', 
    '...', 
    'in_progress', 
    'medium',
    (SELECT id FROM users WHERE email='jane@test.com'),
    (SELECT id FROM users WHERE email='john@test.com')
    ),

  (
    'Add user avatar upload', 
    '...', 
    'in_progress', 
    'medium',
    (SELECT id FROM users WHERE email='jane@test.com'),
    (SELECT id FROM users WHERE email='john@test.com')
    ),
    (
    'Update README', 
    'Improve documentation', 
    'done', 
    'low', 
    NULL,
    (SELECT id FROM users WHERE email = 'jane@test.com')
    ),
    (
    'Improve accessibility', 
    'ARIA labels and contrast fixes', 
    'todo', 
    'medium', 
    NULL,
    (SELECT id FROM users WHERE email='jane@test.com')
    ),
    (
    'Optimize DB queries', 
    'Reduce query count', 
    'todo', 
    'high',
    (SELECT id FROM users WHERE email = 'jane@test.com'),
    (SELECT id FROM users WHERE email = 'john@test.com')
    ),
    (
    'Add avatar upload', 
    'Allow profile pictures', 
    'in_progress', 
    'medium',
    (SELECT id FROM users WHERE email = 'jane@test.com'),
    (SELECT id FROM users WHERE email = 'john@test.com')
    ),
    (
    'Fix navbar overlap', 
    'Navbar overlaps content', 
    'todo', 
    'low', 
    NULL,
    (SELECT id FROM users WHERE email = 'jane@test.com')
    ),
    (
    'Polish UI spacing', 
    'Improve margins and paddings', 
    'done', 
    'low', 
    NULL,
    (SELECT id FROM users WHERE email = 'jane@test.com')
    );
`);

    await pool.query(`
    INSERT INTO issue_labels (issue_id, label_id)
    VALUES
    (
      (SELECT id FROM issues WHERE title = 'Fix login page validation' LIMIT 1),
      (SELECT id FROM labels WHERE name = 'bug' LIMIT 1)
    ),
    (
      (SELECT id FROM issues WHERE title = 'Performance optimization' LIMIT 1),
      (SELECT id FROM labels WHERE name = 'performance' LIMIT 1)
    ),
    (
      (SELECT id FROM issues WHERE title = 'Add dark mode support' LIMIT 1),
      (SELECT id FROM labels WHERE name = 'feature' LIMIT 1)
    );
`);

    console.log('✅ Seed data inserted');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed', err);
    process.exit(1);
  }
};

seedData();
