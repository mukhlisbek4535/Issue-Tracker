import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { Label } from "@/types";
import { useCreateLabel, useDeleteLabel, useLabels } from "@/hooks/useLabels";

const LABEL_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
];

export default function Labels() {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [color, setColor] = useState(LABEL_COLORS[0]);
  const [error, setError] = useState("");

  const {
    data: labels = [],
    isLoading,
    isError,
    error: fetchError,
  } = useLabels();

  const createLabel = useCreateLabel();
  const deleteLabel = useDeleteLabel();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Label name is required");
      return;
    }

    if (trimmedName.length > 50) {
      setError("Label name must be less than 50 characters");
      return;
    }

    if (
      labels.some((l) => l.name.toLowerCase() === trimmedName.toLowerCase())
    ) {
      setError("A label with this name already exists");
      return;
    }

    createLabel.mutate(
      { name: trimmedName, color },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["labels"] });
          setName("");
          setColor(LABEL_COLORS[0]);
          setError("");
        },
        onError: (err: Error) => {
          setError(err.message);
        },
      },
    );
  }

  function handleDelete(labelId: string) {
    if (window.confirm("Are you sure you want to delete this label?")) {
      deleteLabel.mutate(labelId);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            ← Back to issues
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">Labels</h1>
          <p className="text-gray-600 mt-1">
            Manage labels for categorizing issues.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Create New Label
          </h2>
          <form onSubmit={handleCreate}>
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  placeholder="Label name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                {LABEL_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      color === c
                        ? "border-gray-800 scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={createLabel.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {createLabel.isPending ? "Creating..." : "Create"}
              </button>
            </div>

            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Labels</h2>
          </div>

          {isLoading ? (
            <div className="p-6 text-center text-gray-500">
              Loading labels...
            </div>
          ) : isError ? (
            <div className="p-6 text-center text-red-600">
              Error loading labels: {(fetchError as Error).message}
            </div>
          ) : labels.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No labels yet. Create one above.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {labels.map((label: Label) => (
                <li
                  key={label.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="font-medium text-gray-900">
                      {label.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(label.id)}
                    disabled={deleteLabel.isPending}
                    className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
