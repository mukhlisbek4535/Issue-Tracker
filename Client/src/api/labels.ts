import { Label } from "@/types";
import { apiFetch } from "./client";

export const fetchLabels = () => apiFetch("/labels");

export const createLabel = (data: Label) =>
  apiFetch("/labels", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteLabel = (id: string) =>
  apiFetch(`/labels/${id}`, {
    method: "DELETE",
  });
