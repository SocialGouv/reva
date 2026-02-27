const isDevelopment =
  process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "staging";
const baseUrl = process.env.BASE_URL;

export const BACKEND_BASE_URL = isDevelopment
  ? "http://localhost:8080"
  : baseUrl;

export const CANDIDATE_BASE_URL = isDevelopment
  ? "http://localhost:3004/candidat"
  : baseUrl + "/candidat";
