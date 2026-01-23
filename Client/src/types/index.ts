export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface Label {
  id?: string;
  name: string;
  color: string;
}

export interface Comment {
  id: string;
  issueId: string;
  content: string;
  author: User;
  createdAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high";
  labels: Label[];
  assignee?: User;
  createdAt: string;
  updatedAt: string;
}

export type IssueStatus = Issue["status"];
export type IssuePriority = Issue["priority"];

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IssueFilters {
  search?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  labelId?: string;
  assigneeId?: string;
}

export interface IssueSort {
  field: "updatedAt" | "priority" | "status";
  direction: "asc" | "desc";
}

export interface CreateIssueData {
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  labelIds: string[];
  assigneeId?: string;
}

export interface UpdateIssueData extends CreateIssueData {
  id: string;
}

export interface CreateLabelData {
  name: string;
  color: string;
}

export interface CreateCommentData {
  issueId: string;
  content: string;
}
