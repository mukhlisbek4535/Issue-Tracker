import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchComments, createComment, deleteComment } from "../api/comments";

export const useComments = (issueId: string) =>
  useQuery({
    queryKey: ["comments", issueId],
    queryFn: () => fetchComments(issueId),
    enabled: !!issueId,
  });

export const useCreateComment = (issueId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => createComment(issueId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", issueId] });
    },
  });
};

export const useDeleteComment = (issueId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", issueId],
      });
    },
  });
};
