import { useState } from "react";
import { Link } from "react-router-dom";
import { useIssues } from "@/hooks/useIssues";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface Label {
  id: string;
  name: string;
  color: string;
}

interface Issue {
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

function getStatusColor(
  status: "todo" | "in_progress" | "done" | "cancelled",
): string {
  if (status === "todo") return "bg-green-100 text-green-800";
  if (status === "in_progress") return "bg-amber-100 text-amber-800";
  if (status === "cancelled") return "bg-slate-100 text-slate-600";
  return "bg-red-100 text-red-800";
}

function getPriorityColor(priority: "low" | "medium" | "high"): string {
  if (priority === "high") return "bg-red-100 text-red-700";
  if (priority === "medium") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-700";
}

function formatStatus(
  status: "todo" | "in_progress" | "done" | "cancelled",
): string {
  if (status === "in_progress") return "In Progress";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function IssueList() {
  const { clearAuth } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [priorityFilter, setPriorityFilter] = useState("");

  const [labelFilter, setLabelFilter] = useState("");

  const [assigneeFilter, setAssigneeFilter] = useState("");

  const [sortField, setSortField] = useState<
    "updatedAt" | "priority" | "status"
  >("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isError, error } = useIssues({
    page: currentPage,
    search: searchQuery || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    labelId: labelFilter || undefined,
    assigneeId: assigneeFilter || undefined,
    sortField,
    sortDirection,
  });

  const allIssues: Issue[] = data?.data ?? [];
  const meta = data?.meta;

  const uniqueLabels: Label[] = [];
  const seenLabelIds: string[] = [];
  allIssues.forEach((issue) => {
    issue.labels.forEach((label) => {
      if (!seenLabelIds.includes(label.id)) {
        seenLabelIds.push(label.id);
        uniqueLabels.push(label);
      }
    });
  });

  const uniqueAssignees: User[] = [];
  const seenAssigneeIds: string[] = [];
  allIssues.forEach((issue) => {
    if (issue.assignee && !seenAssigneeIds.includes(issue.assignee.id)) {
      seenAssigneeIds.push(issue.assignee.id);
      uniqueAssignees.push(issue.assignee);
    }
  });

  const paginatedIssues = allIssues;

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  }

  function handlePriorityChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPriorityFilter(e.target.value);
    setCurrentPage(1);
  }

  function handleLabelChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setLabelFilter(e.target.value);
    setCurrentPage(1);
  }

  function handleAssigneeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setAssigneeFilter(e.target.value);
    setCurrentPage(1);
  }

  function handleSort(field: "updatedAt" | "priority" | "status") {
    if (sortField === field) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  }

  function goToPreviousPage() {
    if (meta && meta.page > 1) {
      setCurrentPage(meta.page - 1);
    }
  }

  function goToNextPage() {
    if (meta && meta.page < meta.totalPages) {
      setCurrentPage(meta.page + 1);
    }
  }

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("");
    setPriorityFilter("");
    setLabelFilter("");
    setAssigneeFilter("");
    setCurrentPage(1);
  }

  const hasActiveFilters =
    searchQuery ||
    statusFilter ||
    priorityFilter ||
    labelFilter ||
    assigneeFilter;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Issues</h1>
          <div className="flex gap-2">
            <Link
              to="/issues/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              New Issue
            </Link>
            <Button
              variant="outline"
              className="rounded-md bg-red-500 text-white"
              onClick={clearAuth}
            >
              Log Out
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search issues by title..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={priorityFilter}
              onChange={handlePriorityChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={labelFilter}
              onChange={handleLabelChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Labels</option>
              {uniqueLabels.map((label) => (
                <option key={label.id} value={label.id}>
                  {label.name}
                </option>
              ))}
            </select>

            <select
              value={assigneeFilter}
              onChange={handleAssigneeChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Assignees</option>
              {uniqueAssignees.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-500">Loading issues...</div>
          </div>
        )}

        {isError && (
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-12 text-center">
            <div className="text-red-600">
              Error loading issues:{" "}
              {error instanceof Error ? error.message : "Unknown error"}
            </div>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {paginatedIssues.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-500">No issues found</div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                        Title
                      </th>
                      <th
                        onClick={() => handleSort("status")}
                        className="text-left px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                      >
                        Status{" "}
                        {sortField === "status" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        onClick={() => handleSort("priority")}
                        className="text-left px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                      >
                        Priority{" "}
                        {sortField === "priority" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                        Labels
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                        Assignee
                      </th>
                      <th
                        onClick={() => handleSort("updatedAt")}
                        className="text-left px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                      >
                        Updated{" "}
                        {sortField === "updatedAt" &&
                          (sortDirection === "asc" ? "↑" : "↓")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedIssues.map((issue) => (
                      <tr key={issue.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <Link
                            to={`/issues/${issue.id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {issue.title}
                          </Link>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(issue.status)}`}
                          >
                            {formatStatus(issue.status)}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded capitalize ${getPriorityColor(issue.priority)}`}
                          >
                            {issue.priority}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {issue.labels.map((label) => (
                              <span
                                key={label.id}
                                className="inline-block px-2 py-0.5 text-xs rounded"
                                style={{
                                  backgroundColor: label.color + "20",
                                  color: label.color,
                                }}
                              >
                                {label.name}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-600">
                          {issue.assignee?.name || "—"}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDate(issue.updatedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Showing {(meta.page - 1) * meta.limit + 1}–
                  {Math.min(meta.page * meta.limit, meta.totalIssues)}{" "}
                  <span> </span>
                  of {meta.totalIssues} issues
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPreviousPage}
                    disabled={meta.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    Page {meta.page} of {meta.totalPages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={meta.page === meta.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-8 text-center">
          <Link to="/labels" className="text-gray-600 hover:text-gray-900">
            Manage Labels →
          </Link>
        </div>
      </div>
    </div>
  );
}
