import { REST_API_URL } from "@/config/config";

export const getFranceConnectLoginUrl = ({
  certificationId,
  typeAccompagnement,
}: {
  certificationId?: string;
  typeAccompagnement?: string;
}) => {
  const params = new URLSearchParams();
  if (certificationId) {
    params.set("certificationId", certificationId);
  }
  if (typeAccompagnement) {
    params.set("typeAccompagnement", typeAccompagnement);
  }
  const queryString = params.toString();
  return `${REST_API_URL}/account/franceconnect/authorize${queryString ? `?${queryString}` : ""}`;
};
