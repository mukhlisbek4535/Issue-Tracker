import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import type { IssueStatus, IssuePriority, Comment } from "@/types";
import { useAuthStore } from "@/stores/authStore";
import { useDeleteIssue, useIssue } from "@/hooks/useIssues";
import {
  useComments,
  useCreateComment,
  useDeleteComment,
} from "@/hooks/useComments";

function getStatusColor(status: IssueStatus): string {
  switch (status) {
    case "todo":
      return "bg-green-100 text-green-800";
    case "in_progress":
      return "bg-amber-100 text-amber-800";
    case "done":
      return "bg-red-100 text-red-800";
    case "cancelled":
      return "bg-slate-100 text-slate-600";
  }
}

function getPriorityColor(priority: IssuePriority): string {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700";
    case "medium":
      return "bg-yellow-100 text-yellow-700";
    case "low":
      return "bg-gray-100 text-gray-700";
  }
}

function formatStatus(status: IssueStatus): string {
  return status === "in_progress"
    ? "In Progress"
    : status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function IssueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const [showAll, setShowAll] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    data: issue,
    isLoading: issueLoading,
    isError: issueError,
    error: issueErrorData,
  } = useIssue(id);

  const { data: commentsData = [], isLoading: commentsLoading } = useComments(
    id!,
  );
  const visibleComments = showAll ? commentsData : commentsData.slice(0, 5);

  const deleteIssue = useDeleteIssue();

  const createComment = useCreateComment(id!);

  const deleteComment = useDeleteComment(id!);

  function handleDeleteIssue() {
    deleteIssue.mutate(id, {
      onSuccess: () => navigate("/"),
    });
  }

  function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    createComment.mutate(newComment.trim(), {
      onSuccess: () => setNewComment(""),
    });
  }

  if (issueLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading issue...</div>
      </div>
    );
  }

  if (issueError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            ← Back to issues
          </Link>
          <div className="mt-4 bg-white rounded-lg shadow-sm border border-red-200 p-6 text-center">
            <div className="text-red-600">
              Error loading issue: {(issueErrorData as Error).message}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!issue) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/" className="text-gray-600 hover:text-gray-900">
          ← Back to issues
        </Link>

        <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {issue.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(issue.status)}`}
                  >
                    {formatStatus(issue.status)}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded capitalize ${getPriorityColor(issue.priority)}`}
                  >
                    {issue.priority} priority
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/issues/${id}/edit`}
                  className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {issue.description ? (
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {issue.description}
              </div>
            ) : (
              <p className="text-gray-500 italic">No description provided</p>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Assignee:</span>
                <span className="ml-2 text-gray-900">
                  {issue.assignee?.name || "Unassigned"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Updated:</span>
                <span className="ml-2 text-gray-900">
                  {formatDate(issue.updatedAt)}
                </span>
              </div>
            </div>

            {issue.labels.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {issue.labels.map((label) => (
                  <span
                    key={label.id}
                    className="px-2 py-1 text-xs rounded"
                    style={{
                      backgroundColor: label.color + "20",
                      color: label.color,
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Comments</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {commentsLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading comments...
              </div>
            ) : commentsData.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No comments yet
              </div>
            ) : (
              visibleComments.map((comment: Comment) => (
                <div key={comment.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {comment.author.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    {currentUser?.id === comment.author.id && (
                      <button
                        onClick={() => deleteComment.mutate(comment.id)}
                        disabled={deleteComment.isPending}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {commentsData && commentsData.length > 5 && (
            <div className="p-4 text-center">
              <button
                onClick={() => setShowAll((v) => !v)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showAll
                  ? "Show less comments"
                  : `Show all ${commentsData.length} comments`}
              </button>
            </div>
          )}

          <form
            onSubmit={handleAddComment}
            className="p-4 border-t border-gray-200"
          >
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim() || createComment.isPending}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {createComment.isPending ? "Adding..." : "Add Comment"}
              </button>
            </div>
          </form>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900">
                Delete Issue
              </h3>
              <p className="mt-2 text-gray-600">
                Are you sure you want to delete this issue? This action cannot
                be undone.
              </p>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteIssue}
                  disabled={deleteIssue.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteIssue.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
