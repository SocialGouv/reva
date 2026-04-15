import { REST_API_URL } from "@/config/config";

export const getFranceConnectLoginUrl = () =>
  `${REST_API_URL}/account/franceconnect/authorize`;
