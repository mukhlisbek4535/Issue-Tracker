export interface IssueRow {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  creator_id: string;
  creator_name: string;
  created_at: string;
  updated_at: string;

  assignee_id: string | null;
  assignee_name: string | null;

  label_id: string | null;
  label_name: string | null;
  label_color: string | null;
}
