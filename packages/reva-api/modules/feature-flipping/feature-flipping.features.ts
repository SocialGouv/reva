import { prismaClient } from "../../prisma/client";

const KEY_FEATURE_STORE_FILE_WITH_S3 = "store-file-with-s3";

export const activeFeaturesForConnectedUser = async () =>
  (await prismaClient.feature.findMany({ where: { isActive: true } })).map(
    (f) => f.key
  );

export const isS3FeatureEnabled = async () => {
  const feature = await prismaClient.feature.findFirst({
    where: {
      key: KEY_FEATURE_STORE_FILE_WITH_S3,
    },
  });

  return feature?.isActive || false;
};
