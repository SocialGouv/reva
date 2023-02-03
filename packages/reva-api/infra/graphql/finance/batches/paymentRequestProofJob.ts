import { Readable } from "stream";

import { FileUploadSpooler } from "@prisma/client";
import * as ftp from "basic-ftp";

import { prismaClient } from "../../../database/postgres/client";
import { logger } from "../../../logger";

export default async () => {
  logger.info("Starting uploadSpoolerFiles job");

  // Fetch spooled files list
  let spoolerFilesId: Array<{ id: string }>;
  try {
    spoolerFilesId = await prismaClient.fileUploadSpooler.findMany({
      select: {
        id: true,
      },
    });
  } catch (err) {
    logger.error("Failed to fetch spooled files - ", err);
    throw err;
  }
  logger.info(`Found ${spoolerFilesId.length} file(s) to upload.`);

  // Connect to FTP server
  const ftpClient = new ftp.Client();
  try {
    await ftpClient.access({
      host: process.env.FTPS_HOST || "127.0.0.1",
      port: parseInt(process.env.FTPS_PORT || "2121", 10),
      user: process.env.FTPS_USERNAME || "reva",
      password: process.env.FTPS_PASSWORD || "password",
      secure: true,
      secureOptions: {
        rejectUnauthorized: process.env.FTPS_ALLOW_UNAUTHORIZED_CERT !== "true",
      },
    });
  } catch (err) {
    logger.error("Connection to FTP failed", err);
    throw err;
  }
  logger.info("Connected to FTP server.");

  // Upload files to FTP and delete DB record
  try {
    for (const { id } of spoolerFilesId) {
      try {
        // Fetch file data from db
        const spoolerFile = (await prismaClient.fileUploadSpooler.findFirst({
          where: { id },
        })) as FileUploadSpooler;
        logger.info(
          `Processing file ${spoolerFile.description} created at ${spoolerFile.createdAt}`
        );

        // Upload file
        const stream = Readable.from(spoolerFile?.fileContent);
        await ftpClient.uploadFrom(
          stream,
          `${spoolerFile.destinationPath}/${spoolerFile.destinationFileName}`
        );
        stream.destroy();

        // Delete from db
        await prismaClient.fileUploadSpooler.delete({ where: { id } });
      } catch (err) {
        const msg = `Failed to process fileUploadSpooler ${id}`;
        logger.error(`${msg} - ${err}`);
        throw err;
      }
    }
  } catch (e) {
    logger.error("Job interrupted.");
    throw e;
  } finally {
    ftpClient.close();
  }

  logger.info("Finished job with success");
};
