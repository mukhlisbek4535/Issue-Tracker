import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type {
  IssueStatus,
  IssuePriority,
  UpdateIssueData,
  Label,
} from "@/types";
import { useIssue, useUpdateIssue } from "@/hooks/useIssues";
import { useLabels } from "@/hooks/useLabels";
import { useUsers } from "@/hooks/useUsers";

export function EditIssue() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<IssueStatus>("todo");
  const [priority, setPriority] = useState<IssuePriority>("medium");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [assigneeId, setAssigneeId] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    data: issue,
    isLoading: issueLoading,
    isError: issueError,
    error: issueErrorData,
  } = useIssue(id);

  const updateIssue = useUpdateIssue();
  const { data: labels = [] } = useLabels();

  const { data: users = [] } = useUsers();

  useEffect(() => {
    if (issue) {
      setTitle(issue.title);
      setDescription(issue.description);
      setStatus(issue.status);
      setPriority(issue.priority);
      setSelectedLabels(issue.labels.map((l) => l.id));
      setAssigneeId(issue.assignee?.id || "");
    }
  }, [issue]);

  function toggleLabel(labelId: string) {
    setSelectedLabels((prev) =>
      prev.includes(labelId)
        ? prev.filter((lid) => lid !== labelId)
        : [...prev, labelId],
    );
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    if (description.length > 5000) {
      newErrors.description = "Description must be less than 5000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    const data: UpdateIssueData = {
      id: id!,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      labelIds: selectedLabels,
      assigneeId: assigneeId || undefined,
    };

    updateIssue.mutate(
      { id: id!, data },
      { onSuccess: () => navigate(`/issues/${id}`) },
    );
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
        <div className="max-w-2xl mx-auto px-4 py-8">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to={`/issues/${id}`}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to issue
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">
            Edit Issue
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Brief summary of the issue"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Detailed description of the issue"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as IssueStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="assignee"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Assignee
            </label>
            <select
              id="assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Labels
            </label>
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label.id)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    selectedLabels.includes(label.id)
                      ? "border-transparent text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  style={
                    selectedLabels.includes(label.id)
                      ? { backgroundColor: label.color }
                      : undefined
                  }
                >
                  {label.name}
                </button>
              ))}
              {labels.length === 0 && (
                <span className="text-sm text-gray-500">
                  No labels available
                </span>
              )}
            </div>
          </div>

          {updateIssue.isError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
              Failed to update issue: {(updateIssue.error as Error).message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={updateIssue.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {updateIssue.isPending ? "Saving..." : "Save Changes"}
            </button>
            <Link
              to={`/issues/${id}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
