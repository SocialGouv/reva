const isDevelopment =
  process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "staging";

const BASE_URL = process.env.BASE_URL || "https://vae.gouv.fr";

export const BACKEND_BASE_URL = isDevelopment
  ? "http://localhost:8080/api"
  : BASE_URL + "/api";

export const CANDIDATE_BASE_URL = isDevelopment
  ? "http://localhost:3004/candidat"
  : BASE_URL + "/candidat";

export const ADMIN_BASE_URL = isDevelopment
  ? "http://localhost:3003/admin2"
  : BASE_URL + "/admin2";

export const VAE_COLLECTIVE_BASE_URL = isDevelopment
  ? "http://localhost:3005/vae-collective"
  : BASE_URL + "/vae-collective";
