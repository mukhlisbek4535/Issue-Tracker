import pool from '../db';

const dropTables = async () => {
  try {
    await pool.query(`DROP TABLE IF EXISTS issue_labels CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS comments CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS issues CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS labels CASCADE;`);
    await pool.query(`DROP TABLE IF EXISTS users CASCADE;`);

    console.log('🗑️ All tables dropped successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to drop tables', error);
    process.exit(1);
  }
};

dropTables();
