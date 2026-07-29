import { request } from "./api";

export const authService = {
  login: (credentials) =>
    request({ url: "/auth/login", method: "post", data: credentials }),
  register: (payload) =>
    request({ url: "/auth/register", method: "post", data: payload }),
  logout: () => request({ url: "/auth/logout", method: "post" }),
  me: () => request({ url: "/auth/me" }),
  forgotPassword: (email) =>
    request({ url: "/auth/forgot-password", method: "post", data: { email } }),
  resetPassword: (payload) =>
    request({ url: "/auth/reset-password", method: "post", data: payload }),
};

export default authService;
