import jwt from "jsonwebtoken";

import { prismaClient } from "@/prisma/client";

export const getMetabaseIframeUrl = async (maisonMereAapId: string) => {
  const METABASE_SITE_URL = process.env.METABASE_SITE_URL;
  const METABASE_SECRET_KEY = process.env.METABASE_SECRET_KEY;

  if (!METABASE_SITE_URL || !METABASE_SECRET_KEY) {
    console.error(
      "Missing METABASE_SITE_URL or METABASE_SECRET_KEY environment variables",
    );
    return null;
  }

  const maisonMereAAPVaeco = await prismaClient.maisonMereAAPVaeco.findUnique({
    where: {
      maisonMereAAPId: maisonMereAapId,
    },
  });

  const hasVaecoCandidacies = maisonMereAAPVaeco?.hasVaecoCandidacies;

  const payload = {
    resource: {
      dashboard: hasVaecoCandidacies ? 272 : 182,
    },
    params: {
      id_maison_mere: [maisonMereAapId],
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
