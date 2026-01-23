import { CreateIssueData, Issue, UpdateIssueData } from "@/types";
import { apiFetch } from "./client";

export const fetchIssues = (query: string) => apiFetch(`/issues?${query}`);
export const fetchIssue = (id: string) => apiFetch(`/issues/${id}`);

export const createIssue = (data: CreateIssueData) =>
  apiFetch("/issues", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateIssue = (id: string, data: UpdateIssueData) =>
  apiFetch(`/issues/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteIssue = (id: string) =>
  apiFetch(`/issues/${id}`, {
    method: "DELETE",
  });
