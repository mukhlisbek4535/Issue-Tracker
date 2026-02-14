import { apiFetch } from "./client";

export const fetchComments = (issueId: string) =>
  apiFetch(`/issues/${issueId}/comments`);

export const createComment = (issueId: string, content: string) =>
  apiFetch(`/issues/${issueId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });

export const deleteComment = (commentId: string) =>
  apiFetch(`/comments/${commentId}`, {
    method: "DELETE",
  });
