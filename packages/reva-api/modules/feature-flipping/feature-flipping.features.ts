import { uniq } from "lodash";

import { prismaClient } from "../../prisma/client";

export const activeFeaturesForConnectedUser = async ({
  userKeycloakId,
}: {
  userKeycloakId?: string | null;
}) => {
  const commonFeatures = (
    await prismaClient.feature.findMany({ where: { isActive: true } })
  ).map((f) => f.key);

  const betaTestedFeatures = userKeycloakId
    ? (
        await prismaClient.featureBetaTest.findMany({
          where: { accountKeycloakId: userKeycloakId },
        })
      ).map((f) => f.featureKey)
    : [];

  return uniq([...commonFeatures, ...betaTestedFeatures]);
};

export const getFeatureByKey = async (key: string) => {
  const feature = await prismaClient.feature.findFirst({
    where: {
      key,
    },
  });

  return feature;
};
