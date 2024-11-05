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
          where: { account: { keycloakId: userKeycloakId } },
        })
      ).map((f) => f.featureKey)
    : [];

  return uniq([...commonFeatures, ...betaTestedFeatures]);
};

export const isFeatureActiveForUser = async ({
  userKeycloakId,
  feature,
}: {
  userKeycloakId?: string | null;
  feature: string;
}) => {
  const activeFeatures = await activeFeaturesForConnectedUser({
    userKeycloakId,
  });

  return activeFeatures.includes(feature);
};

export const getFeatures = () =>
  prismaClient.feature.findMany({ orderBy: { createdAt: "desc" } });

export const toggleFeature = ({
  featureKey,
  isActive,
}: {
  featureKey: string;
  isActive: boolean;
}) =>
  prismaClient.feature.update({
    where: { key: featureKey },
    data: { isActive },
  });
