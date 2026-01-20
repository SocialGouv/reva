import jwt from "jsonwebtoken";

import { isFeatureActiveForUser } from "@/modules/feature-flipping/feature-flipping.features";

import { CertificationAuthority } from "../certification-authority.types";

import { getCertificationAuthorityStructuresByCertificationAuthorityId } from "./getCertificationAuthorityStructuresByCertificationAuthorityId";

const ALLOWED_CERTIFICATION_AUTHORITY_STRUCTURES: Record<
  string,
  { filter: string; dashboardId: number }
> = {
  "Ministère du Travail, du Plein emploi et de l'Insertion": {
    filter: "dreets",
    dashboardId: 154,
  },
  "Ministère de l'Agriculture, de l'Agro-alimentaire et de la Souveraineté Alimentaire":
    {
      filter: "gestionnaire_de_candidatures",
      dashboardId: 194,
    },
  "Ministère de l'Éducation nationale, de l'Enseignement supérieur et de la Recherche":
    {
      filter: "gestionnaire_de_candidatures",
      dashboardId: 200,
    },
};

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
    !Object.keys(ALLOWED_CERTIFICATION_AUTHORITY_STRUCTURES).includes(
      certificationAuthorityStructures[0].label,
    )
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

  const certificationAuthorityStructureParams =
    ALLOWED_CERTIFICATION_AUTHORITY_STRUCTURES[
      certificationAuthorityStructures[0].label
    ];

  const payload = {
    resource: {
      dashboard: certificationAuthorityStructureParams.dashboardId,
    },
    params: {
      [certificationAuthorityStructureParams.filter]: [
        certificationAuthority.label,
      ],
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
