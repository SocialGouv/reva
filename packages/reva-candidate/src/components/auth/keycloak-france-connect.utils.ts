import { REST_API_URL } from "@/config/config";

export const getFranceConnectLoginUrl = (certificationId?: string) =>
  `${REST_API_URL}/account/franceconnect/authorize${
    certificationId
      ? `?certificationId=${encodeURIComponent(certificationId)}`
      : ""
  }`;
