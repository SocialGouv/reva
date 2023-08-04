import { Readable } from "stream";

import * as ftp from "basic-ftp";

import { logger } from "../../../../../logger";

export async function sendStreamToFtp(params: {
  fileName: string;
  readableStream: Readable;
}) {
  const client = new ftp.Client();

  try {
    logger.info(`FTPS ${process.env.FTPS_HOST}:${process.env.FTPS_PORT}`);

    client.ftp.verbose = true;
    await client.access({
      host: process.env.FTPS_HOST || "127.0.0.1",
      port: parseInt(process.env.FTPS_PORT || "2121", 10),
      user: process.env.FTPS_USERNAME || "reva",
      password: process.env.FTPS_PASSWORD || "password",
      secure: true,
      secureOptions: {
        rejectUnauthorized: process.env.FTPS_ALLOW_UNAUTHORIZED_CERT !== "true",
      },
    });

    logger.info("Before sending stream");
    await client.uploadFrom(params.readableStream, `import/${params.fileName}`);
    logger.info("Stream sent");
  } catch (e) {
    logger.error("ftp error");
    throw e;
  } finally {
    if (!client.closed) {
      logger.info("Closing FTP connection");
      client.close();
    }
  }
}
