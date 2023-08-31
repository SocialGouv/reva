import { Readable } from "stream";

import { Feature } from "@prisma/client";
import * as csv from "fast-csv";

import { sendStreamToFtp } from "../../../../infra/ftp/ftp";
import { logger } from "../../../../infra/logger";
import { prismaClient } from "../../../../prisma/client";

const generatePaymentRequestBatchCsvStream = async (
  itemsToSendIds: string[]
) => {
  const RECORDS_PER_FETCH = 10;
  let skip = 0;
  const paymentRequestBatchesWaitingToBeSentStream = new Readable({
    objectMode: true,
    async read() {
      const results = await prismaClient.paymentRequestBatch.findMany({
        where: { id: { in: itemsToSendIds } },
        skip,
        take: RECORDS_PER_FETCH,
      });

      results.length
        ? results.map((prb) => this.push(prb.content))
        : this.push(null);
      skip += RECORDS_PER_FETCH;
    },
  });

  const csvStream = csv.format({ headers: true, delimiter: ";" });
  return paymentRequestBatchesWaitingToBeSentStream.pipe(csvStream);
};

export const batchPaymentRequest = async (batchKey: string) => {
  try {
    // Start the execution
    const batchExecution = await prismaClient.batchExecution.create({
      data: {
        key: batchKey,
        startedAt: new Date(Date.now()),
      },
    });

    const itemsToSendIds = (
      await prismaClient.paymentRequestBatch.findMany({
        where: { sent: false },
        select: { id: true },
      })
    ).map((v) => v.id);

    if (itemsToSendIds.length === 0) {
      logger.info("Found no fundingRequestUnifvae to process.");
    } else {
      const batchReadableStream = await generatePaymentRequestBatchCsvStream(
        itemsToSendIds
      );

      const fileDate = new Date().toLocaleDateString("sv").split("-").join("");
      const fileName = `DR_${fileDate}.csv`;

      await sendStreamToFtp({
        fileName,
        readableStream: batchReadableStream,
      });

      await prismaClient.paymentRequestBatch.updateMany({
        where: { id: { in: itemsToSendIds } },
        data: { sent: true },
      });
    }
    // Finish the execution
    await prismaClient.batchExecution.update({
      where: {
        id: batchExecution.id,
      },
      data: {
        finishedAt: new Date(Date.now()),
      },
    });
  } catch (e) {
    logger.error(
      `Une erreur est survenue lors de l'exécution du batch ${batchKey}`,
      e
    );
    e instanceof Error && logger.error(e.message);
  } finally {
    logger.info(`Batch ${batchKey} terminé`);
  }
};
