import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLabels, createLabel, deleteLabel } from "../api/labels";

export const useLabels = () =>
  useQuery({
    queryKey: ["labels"],
    queryFn: fetchLabels,
  });

export const useCreateLabel = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createLabel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["labels"] });
    },
  });
};

export const useDeleteLabel = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteLabel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["labels"] });
    },
  });
};
