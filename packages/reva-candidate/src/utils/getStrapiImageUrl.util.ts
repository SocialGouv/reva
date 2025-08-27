import { STRAPI_BASE_URL } from "@/config/config";

export const getStrapiImageUrl = (strapiUrl: string | null | undefined) => {
  if (!strapiUrl) return "";
  return strapiUrl.startsWith("http")
    ? strapiUrl
    : `${STRAPI_BASE_URL}${strapiUrl}`;
};
