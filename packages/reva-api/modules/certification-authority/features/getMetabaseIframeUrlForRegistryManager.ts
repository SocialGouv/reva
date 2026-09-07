import jwt from "jsonwebtoken";

import { isFeatureActiveForUser } from "@/modules/feature-flipping/feature-flipping.features";

import { CertificationAuthorityStructure } from "../certification-authority.types";

export const getMetabaseIframeUrlForRegistryManager = async (
  certificationAuthorityStructure: CertificationAuthorityStructure,
) => {
  const isFeatureActive = await isFeatureActiveForUser({
    feature: "SHOW_METABASE_DASHBOARD_FOR_REGISTRY_MANAGER",
  });

  if (!isFeatureActive) {
    return null;
  }

  const METABASE_SITE_URL = process.env.METABASE_SITE_URL;
  const METABASE_SECRET_KEY = process.env.METABASE_SECRET_KEY;

  if (!METABASE_SITE_URL || !METABASE_SECRET_KEY) {
    console.error(
      "Missing METABASE_SITE_URL or METABASE_SECRET_KEY environment variables",
    );
    return null;
  }

  const payload = {
    resource: {
      dashboard: 279,
    },
    params: {
      id_structure_certificatrice: [certificationAuthorityStructure.id],
    },
    exp: Math.round(Date.now() / 1000) + 30 * 60, // 30 minute expiration
  };
  const token = jwt.sign(payload, METABASE_SECRET_KEY);

  return (
    METABASE_SITE_URL +
    "/embed/dashboard/" +
    token +
    "#bordered=true&titled=true"
  );
};
