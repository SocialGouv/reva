import jwt from "jsonwebtoken";

import { isFeatureActiveForUser } from "@/modules/feature-flipping/feature-flipping.features";

import { CertificationAuthority } from "../certification-authority.types";

import { getCertificationAuthorityStructuresByCertificationAuthorityId } from "./getCertificationAuthorityStructuresByCertificationAuthorityId";

export const getMetabaseIframeUrl = async (
  certificationAuthority: CertificationAuthority,
) => {
  const isFeatureActive = await isFeatureActiveForUser({
    feature: "SHOW_METABASE_DASHBOARD",
  });
  if (!isFeatureActive) {
    return null;
  }

  const certificationAuthorityStructures =
    await getCertificationAuthorityStructuresByCertificationAuthorityId({
      certificationAuthorityId: certificationAuthority.id,
    });

  if (
    certificationAuthorityStructures[0].label !==
    "Ministère du Travail, du Plein emploi et de l'Insertion"
  ) {
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
    resource: { dashboard: 154 },
    params: {
      dreets: [certificationAuthority.label],
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
