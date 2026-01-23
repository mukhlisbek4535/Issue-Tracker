import { apiFetch } from "./client";

export const fetchUsers = () => apiFetch("/users");
