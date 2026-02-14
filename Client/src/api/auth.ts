import { apiFetch } from "./client";

export const login = async (data: { email: string; password: string }) => {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return res;
};

export const register = async (data: {
  name: string;
  email: string;
  password: string;
}) =>
  apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
