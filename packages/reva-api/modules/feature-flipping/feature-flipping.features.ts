import { prismaClient } from "../../prisma/client";

export const activeFeaturesForConnectedUser = async () =>
  (await prismaClient.feature.findMany({ where: { isActive: true } })).map(
    (f) => f.key
  );

export const getFeatureByKey = async (key: string) => {
  const feature = await prismaClient.feature.findFirst({
    where: {
      key,
    },
  });

  return feature;
};
