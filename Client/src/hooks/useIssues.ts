import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  fetchIssues,
  createIssue,
  updateIssue,
  deleteIssue,
  fetchIssue,
} from "../api/issues";
import { UpdateIssueData } from "@/types";
import { useNavigate } from "react-router-dom";

export const useIssues = (params: {
  page: number;
  search?: string;
  status?: string;
  priority?: string;
  labelId?: string;
  assigneeId?: string;
  sortField?: string;
  sortDirection?: string;
}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();

  return useQuery({
    queryKey: ["issues", params],
    queryFn: () => fetchIssues(query),
    placeholderData: keepPreviousData,
  });
};

export const useIssue = (id: string) =>
  useQuery({
    queryKey: ["issue", id],
    queryFn: () => fetchIssue(id),
    enabled: !!id,
  });

export const useCreateIssue = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: createIssue,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["issues"] });
      navigate("/");
    },
  });
};

export const useUpdateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIssueData }) =>
      updateIssue(id, data),
    onSuccess: (_data, variables) => {
      const { id } = variables;
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["issue", id] });
    },
  });
};

export const useDeleteIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
    },
  });
};
