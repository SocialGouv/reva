import { Readable } from "stream";

import { Feature } from "@prisma/client";
import * as csv from "fast-csv";
import Client from "ftp-ts";
import pino from "pino";

import { prismaClient } from "../database/postgres/client";

const BATCH_KEY = "batch.demande-financement";
const logger = pino();

const isFeatureActive = (feature: Feature | null) =>
  feature && feature.isActive;

const generateFundingRequestBatchCsvStream = async (
  itemsToSendIds: string[]
) => {
  const RECORDS_PER_FETCH = 10;
  let skip = 0;
  const fundingRequestBatchesWaitingToBeSentStream = new Readable({
    objectMode: true,
    async read() {
      const results = await prismaClient.fundingRequestBatch.findMany({
        where: { id: { in: itemsToSendIds } },
        skip,
        take: RECORDS_PER_FETCH,
      });

      results.map((frb) => this.push(frb.content));
      skip += RECORDS_PER_FETCH;
    },
  });

  return fundingRequestBatchesWaitingToBeSentStream.pipe(
    csv.format({ headers: true })
  );
};

export const batchFundingRequest = async () => {
  try {
    // Check if the feature is active
    const fundingRequestFeature = await prismaClient.feature.findFirst({
      where: {
        key: BATCH_KEY,
      },
    });

    if (!isFeatureActive(fundingRequestFeature)) {
      logger.info(`Le batch ${BATCH_KEY} est inactif.`);
      return;
    }

    // Start the execution
    const batchExecution = await prismaClient.batchExecution.create({
      data: {
        key: BATCH_KEY,
        startedAt: new Date(Date.now()),
      },
    });

    const itemsToSendIds = (
      await prismaClient.fundingRequestBatch.findMany({
        where: { sent: false },
        select: { id: true },
      })
    ).map((v) => v.id);

    const batchReadableStream = await generateFundingRequestBatchCsvStream(
      itemsToSendIds
    );

    const fileDate = new Date().toLocaleDateString("sv").split("-").join("");
    const fileName = `DAF-${fileDate}.csv`;
    sendFundingRequestsStream({
      fileName,
      readableStream: batchReadableStream,
    });

    await prismaClient.fundingRequestBatch.updateMany({
      where: { id: { in: itemsToSendIds } },
      data: { sent: true },
    });

    // Finish the execution
    await prismaClient.batchExecution.update({
      where: {
        id: batchExecution.id,
      },
      data: {
        finishedAt: new Date(Date.now()),
      },
    });
  } catch (e: any) {
    logger.error(
      `Une erreur est survenue lors de l'exécution du batch ${BATCH_KEY}`,
      e
    );
    logger.error(e.message);
  } finally {
    logger.info(`Batch ${BATCH_KEY} terminé`);
  }
};

async function sendFundingRequestsStream(params: {
  fileName: string;
  readableStream: NodeJS.ReadableStream;
}) {
  let connexion = null;
  try {
    logger.info(`FTPS ${process.env.FTPS_HOST}:${process.env.FTPS_PORT}`);
    connexion = await Client.connect({
      host: process.env.FTPS_HOST || "127.0.0.1",
      port: parseInt(process.env.FTPS_PORT || "2121", 10),
      user: process.env.FTPS_USERNAME || "reva",
      password: process.env.FTPS_PASSWORD || "password",
      secure: true,
      debug: console.log,
    });
    await connexion.put(params.readableStream, `import/${params.fileName}`);
    logger.info("Stream sent");
  } catch (e: unknown) {
    logger.error(e);
  } finally {
    if (connexion) {
      connexion.end();
    }
  }
}
