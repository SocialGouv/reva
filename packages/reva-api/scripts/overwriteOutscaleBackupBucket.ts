import {
  CopyObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";

import { logger } from "../modules/shared/logger/logger";

const createS3Client = () => {
  if (
    !process.env.OUTSCALE_ACCESS_KEY_ID ||
    !process.env.OUTSCALE_SECRET_ACCESS_KEY ||
    !process.env.OUTSCALE_BUCKET_NAME ||
    !process.env.OUTSCALE_BACKUP_BUCKET_NAME ||
    !process.env.OUTSCALE_BUCKET_REGION ||
    !process.env.OUTSCALE_OBJECT_STORAGE_ENDPOINT
  ) {
    throw new Error("Missing required Outscale environment variables");
  }

  return new S3Client({
    endpoint: process.env.OUTSCALE_OBJECT_STORAGE_ENDPOINT,
    region: process.env.OUTSCALE_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.OUTSCALE_ACCESS_KEY_ID,
      secretAccessKey: process.env.OUTSCALE_SECRET_ACCESS_KEY,
    },
  });
};

export const overwriteOutscaleBackupBucket = async ({
  sourceBucket,
  backupBucket,
}: {
  sourceBucket: string;
  backupBucket: string;
}): Promise<void> => {
  if (!sourceBucket || !backupBucket) {
    throw new Error("Missing required source or backup bucket");
  }

  logger.info("==========================================");
  logger.info("Outscale Bucket Backup Overwrite Script");
  logger.info(`Date: ${new Date().toISOString()}`);
  logger.info("==========================================");

  logger.info(`Source bucket: ${sourceBucket} (READ-ONLY)`);
  logger.info(`Backup bucket: ${backupBucket} (WILL BE OVERWRITTEN)`);
  logger.info(`Region: ${process.env.OUTSCALE_BUCKET_REGION}`);
  logger.info(`Endpoint: ${process.env.OUTSCALE_OBJECT_STORAGE_ENDPOINT}`);
  logger.info("==========================================");

  const client = createS3Client();

  try {
    // ÉTAPE 1: Supprimer TOUT le contenu du bucket backup
    logger.info(`Clearing all objects from backup bucket: ${backupBucket}`);
    const backupObjects: string[] = [];
    let continuationToken: string | undefined;

    // Lister tous les objets du backup
    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: backupBucket,
        ContinuationToken: continuationToken,
      });

      const response: ListObjectsV2CommandOutput =
        await client.send(listCommand);

      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key) {
            backupObjects.push(object.Key);
          }
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    logger.info(
      `Found ${backupObjects.length} objects to delete from backup bucket`,
    );

    // Supprimer tous les objets du backup par lots
    const batchSize = 50;
    let deletedCount = 0;

    for (let i = 0; i < backupObjects.length; i += batchSize) {
      const batch = backupObjects.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (key) => {
          try {
            const deleteCommand = new DeleteObjectCommand({
              Bucket: backupBucket,
              Key: key,
            });
            await client.send(deleteCommand);
            deletedCount++;
          } catch (error) {
            logger.error(`Error deleting object ${key} from backup: ${error}`);
            throw error;
          }
        }),
      );

      if (deletedCount % 100 === 0) {
        logger.info(`Deleted ${deletedCount} objects from backup...`);
      }
    }

    logger.info(`Deleted ${deletedCount} objects from backup bucket`);

    // ÉTAPE 2: Copier TOUT le contenu du bucket source vers le backup
    logger.info(
      `Copying all objects from source bucket: ${sourceBucket} (READ-ONLY)`,
    );
    const sourceObjects: string[] = [];
    continuationToken = undefined;

    // Lister tous les objets du source (READ-ONLY)
    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: sourceBucket,
        ContinuationToken: continuationToken,
      });

      const response: ListObjectsV2CommandOutput =
        await client.send(listCommand);

      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key) {
            sourceObjects.push(object.Key);
          }
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    logger.info(
      `Found ${sourceObjects.length} objects to copy from source bucket`,
    );

    // Copier tous les objets du source vers le backup par lots
    let copiedCount = 0;

    for (let i = 0; i < sourceObjects.length; i += batchSize) {
      const batch = sourceObjects.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (key) => {
          try {
            const copyCommand = new CopyObjectCommand({
              Bucket: backupBucket,
              CopySource: `${sourceBucket}/${key}`,
              Key: key,
            });
            await client.send(copyCommand);
            copiedCount++;
          } catch (error) {
            logger.error(`Error copying object ${key} from source: ${error}`);
            throw error;
          }
        }),
      );

      if (copiedCount % 100 === 0) {
        logger.info(`Copied ${copiedCount} objects from source...`);
      }
    }

    logger.info("==========================================");
    logger.info("Backup overwrite completed successfully!");
    logger.info(`Date: ${new Date().toISOString()}`);
    logger.info(`Source bucket: ${sourceBucket} (unchanged - READ-ONLY)`);
    logger.info(`Backup bucket: ${backupBucket} (completely overwritten)`);
    logger.info(`Objects deleted from backup: ${deletedCount}`);
    logger.info(`Objects copied from source: ${copiedCount}`);
    logger.info("==========================================");
  } catch (error) {
    logger.error("Error during bucket overwrite:");
    logger.error(error);
    throw error;
  }
};
