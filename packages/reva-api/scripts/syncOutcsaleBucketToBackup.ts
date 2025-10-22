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

export const syncOutscaleBucketToBackup = async (): Promise<void> => {
  logger.info("==========================================");
  logger.info("Outscale Bucket Backup Sync Script");
  logger.info(`Date: ${new Date().toISOString()}`);
  logger.info("==========================================");

  const sourceBucket = process.env.OUTSCALE_BUCKET_NAME!;
  const backupBucket = process.env.OUTSCALE_BACKUP_BUCKET_NAME!;

  logger.info(`Source bucket: ${sourceBucket}`);
  logger.info(`Backup bucket: ${backupBucket}`);
  logger.info(`Region: ${process.env.OUTSCALE_BUCKET_REGION}`);
  logger.info(`Endpoint: ${process.env.OUTSCALE_OBJECT_STORAGE_ENDPOINT}`);
  logger.info("==========================================");

  const client = createS3Client();

  try {
    // Récupération des objets source avec métadonnées (optimisé)
    logger.info("Listing objects from source bucket with metadata...");
    const sourceObjects = new Map<
      string,
      { ETag?: string; LastModified?: Date }
    >();
    let continuationToken: string | undefined;

    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: sourceBucket,
        ContinuationToken: continuationToken,
        FetchOwner: true, // Récupère les métadonnées dans la liste
      });

      const response: ListObjectsV2CommandOutput =
        await client.send(listCommand);

      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key) {
            sourceObjects.set(object.Key, {
              ETag: object.ETag,
              LastModified: object.LastModified,
            });
          }
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    logger.info(`Found ${sourceObjects.size} objects in source bucket`);

    // Récupération des objets backup avec métadonnées
    logger.info("Listing objects from backup bucket with metadata...");
    const backupObjects = new Map<
      string,
      { ETag?: string; LastModified?: Date }
    >();
    continuationToken = undefined;

    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: backupBucket,
        ContinuationToken: continuationToken,
        FetchOwner: true,
      });

      const response: ListObjectsV2CommandOutput =
        await client.send(listCommand);

      if (response.Contents) {
        for (const object of response.Contents) {
          if (object.Key) {
            backupObjects.set(object.Key, {
              ETag: object.ETag,
              LastModified: object.LastModified,
            });
          }
        }
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    logger.info(`Found ${backupObjects.size} objects in backup bucket`);

    logger.info("==========================================");
    logger.info("Starting synchronization...");

    const copyOperations: string[] = [];
    let skippedCount = 0;

    // Comparaison intelligente : ETag d'abord (plus rapide), puis LastModified
    for (const [key, sourceMeta] of sourceObjects) {
      const backupMeta = backupObjects.get(key);

      let shouldCopy = true;

      if (backupMeta) {
        if (
          sourceMeta.ETag &&
          backupMeta.ETag &&
          sourceMeta.ETag === backupMeta.ETag
        ) {
          shouldCopy = false; // Fichier identique, ignorer
        } else if (sourceMeta.LastModified && backupMeta.LastModified) {
          shouldCopy = sourceMeta.LastModified > backupMeta.LastModified;
        }
      }

      if (shouldCopy) {
        copyOperations.push(key);
      } else {
        skippedCount++;
      }
    }

    logger.info(
      `Will copy ${copyOperations.length} objects, skip ${skippedCount} unchanged`,
    );

    // Copie par lots de 50 fichiers en parallèle
    const batchSize = 50;
    let copiedCount = 0;

    for (let i = 0; i < copyOperations.length; i += batchSize) {
      const batch = copyOperations.slice(i, i + batchSize);

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
            logger.error(`Error copying object ${key}: ${error}`);
          }
        }),
      );

      if (copiedCount % 100 === 0) {
        logger.info(`Copied ${copiedCount} objects...`);
      }
    }

    logger.info(`Copied ${copiedCount} new/modified objects`);
    logger.info(`Skipped ${skippedCount} unchanged objects`);

    // Suppression des objets orphelins du backup
    const deleteOperations: string[] = [];
    for (const key of backupObjects.keys()) {
      if (!sourceObjects.has(key)) {
        deleteOperations.push(key);
      }
    }

    logger.info(`Will delete ${deleteOperations.length} orphaned objects`);

    // Suppression par lots de 50 fichiers en parallèle
    let deletedCount = 0;
    for (let i = 0; i < deleteOperations.length; i += batchSize) {
      const batch = deleteOperations.slice(i, i + batchSize);

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
            logger.error(`Error deleting object ${key}: ${error}`);
          }
        }),
      );

      if (deletedCount % 100 === 0) {
        logger.info(`Deleted ${deletedCount} objects...`);
      }
    }

    logger.info(`Deleted ${deletedCount} orphaned objects from backup`);

    logger.info("==========================================");
    logger.info("Backup completed successfully!");
    logger.info(`Date: ${new Date().toISOString()}`);
    logger.info(`Files copied: ${copiedCount}`);
    logger.info(`Files skipped: ${skippedCount}`);
    logger.info(`Files deleted: ${deletedCount}`);
    logger.info("==========================================");
  } catch (error) {
    logger.error("Error during bucket synchronization:");
    logger.error(error);
    throw error;
  }
};
