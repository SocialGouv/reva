import {
  DeleteObjectCommand,
  GetObjectAclCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { buffer } from "stream/consumers";
import { logger } from "../logger";
import { FileInterface, UploadedFile } from "./file.interface";

const SIGNED_URL_EXPIRE_SECONDS = 60 * 5;

const createS3Client = () => {
  if (
    !process.env.OUTSCALE_ACCESS_KEY_ID ||
    !process.env.OUTSCALE_SECRET_ACCESS_KEY ||
    !process.env.OUTSCALE_BUCKET_NAME ||
    !process.env.OUTSCALE_BUCKET_REGION ||
    !process.env.OUTSCALE_OBJECT_STORAGE_ENDPOINT
  ) {
    return undefined;
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
const client = createS3Client?.();

export const getUploadLink = async (
  fileKeyPath: string,
): Promise<string | undefined> => getSignedUrlForUpload(fileKeyPath);

export const getDownloadLink = async (
  fileKeyPath: string,
): Promise<string | undefined> => getSignedUrlForDownload(fileKeyPath);

export const fileExists = async (file: FileInterface): Promise<boolean> => {
  try {
    const command = new GetObjectAclCommand({
      Bucket: process.env.OUTSCALE_BUCKET_NAME,
      Key: file.fileKeyPath,
    });
    const result = await client?.send(command);
    return result?.$metadata?.httpStatusCode === 200;
  } catch (error) {
    console.error(error);
    logger.error(error);
    return false;
  }
};

export const uploadFile = async (
  file: FileInterface,
  data: Buffer,
): Promise<void> => {
  const command = new PutObjectCommand({
    Bucket: process.env.OUTSCALE_BUCKET_NAME,
    Key: file.fileKeyPath,
    Body: data,
    ContentType: file.fileType,
  });

  try {
    await client?.send(command);
  } catch (error) {
    console.error(error);
    logger.error(error);
  }
};

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

const uploadWithRetry = async (
  file: FileInterface,
  data: Buffer,
  retry = 0,
) => {
  await uploadFile(file, data);

  const exists = await fileExists(file);
  if (!exists && retry < 3) {
    await wait(1000);
    await uploadWithRetry(file, data, retry + 1);
  } else if (!exists) {
    throw new Error(
      `Une erreur est survenue lors de l'envoi de(s) fichier(s). Veuillez réessayer.`,
    );
  }
};

export const deleteFile = async (fileKeyPath: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.OUTSCALE_BUCKET_NAME,
    Key: fileKeyPath,
  });

  try {
    await client?.send(command);
  } catch (error) {
    console.error(error);
    logger.error(error);
  }
};

export const getSignedUrlForUpload = async (
  fileKeyPath: string,
): Promise<string | undefined> => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.OUTSCALE_BUCKET_NAME,
      Key: fileKeyPath,
    });
    if (!client) return;
    return await getSignedUrl(client, command, {
      expiresIn: SIGNED_URL_EXPIRE_SECONDS,
    });
  } catch (error) {
    console.error(error);
    logger.error(error);
    return undefined;
  }
};

export const getSignedUrlForDownload = async (
  fileKeyPath: string,
): Promise<string | undefined> => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.OUTSCALE_BUCKET_NAME,
      Key: fileKeyPath,
    });
    if (!client) return;
    return await getSignedUrl(client, command, {
      expiresIn: SIGNED_URL_EXPIRE_SECONDS,
    });
  } catch (error) {
    console.error(error);
    logger.error(error);
    return undefined;
  }
};

export const getUploadedFile = async (
  filePromise: GraphqlUploadedFile,
): Promise<UploadedFile> => {
  const file = await filePromise;
  const fileContentBuffer = await buffer(file.createReadStream());
  return {
    filename: file.filename,
    _buf: fileContentBuffer,
    mimetype: file.mimetype,
  };
};

export const emptyUploadedFileStream = async (file?: GraphqlUploadedFile) => {
  try {
    if (file) {
      const stream = (await file).createReadStream();
      stream.on("data", () => null);
    }
  } catch (_) {
    //do nothing
  }
};

export const uploadFileToS3 = ({
  filePath,
  file,
}: {
  filePath: string;
  file: UploadedFile;
}) =>
  uploadWithRetry(
    {
      fileKeyPath: filePath,
      fileType: file.mimetype,
    },
    file._buf,
  );

export const uploadFilesToS3 = async (
  files: {
    filePath: string;
    file: UploadedFile;
  }[],
) => {
  try {
    for (const data of files) {
      await uploadWithRetry(
        {
          fileKeyPath: data.filePath,
          fileType: data.file.mimetype,
        },
        data.file._buf,
      );
    }

    return;
  } catch (error) {
    console.error(error);
  }

  for (const data of files) {
    await deleteFile(data.filePath);
  }

  throw new Error(
    `Une erreur est survenue lors de l'envoi de(s) fichier(s). Veuillez réessayer.`,
  );
};
