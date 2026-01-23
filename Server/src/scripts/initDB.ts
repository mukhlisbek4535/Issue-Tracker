import {
  createUsersTable,
  createIssueTable,
  createIssueCommentsTable,
  createLabelTable,
  createIssueLabelsTable,
  enableUUIDExtension,
} from './createTables';

const initDb = async () => {
  try {
    await enableUUIDExtension();
    await createUsersTable();
    await createLabelTable();
    await createIssueTable();
    await createIssueLabelsTable();
    await createIssueCommentsTable();

    console.log('✅ All tables created successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating tables', err);
    process.exit(1);
  }
};

initDb();
