import { Readable } from "stream";

import * as csv from "fast-csv";

import { prismaClient } from "../../../../prisma/client";
import { logger } from "../../../shared/logger";
import { sendStreamToFtp } from "../../shared/ftp";

export const batchPaymentRequestUnifvae = async (batchKey: string) => {
  try {
    // Start the execution
    const batchExecution = await prismaClient.batchExecution.create({
      data: {
        key: batchKey,
        startedAt: new Date(Date.now()),
      },
    });

    const itemsToSendIds = (
      await prismaClient.paymentRequestBatchUnifvae.findMany({
        where: { sent: false },
        select: { id: true },
      })
    ).map((v) => v.id);

    if (itemsToSendIds.length === 0) {
      logger.info("Found no paymentRequestUnifvae to process.");
    } else {
      const fileDate = new Date().toLocaleDateString("sv").split("-").join("");
      const fileName = `DR2_${fileDate}.csv`;

      const batchReadableStream =
        await generatePaymentRequestUnifvaeBatchCsvStream(itemsToSendIds);

      if (process.env.APP_ENV !== "production") {
        logger.info(`Writing payment_request_unifvae batch to "${fileName}"`);
        await sendStreamToConsole(batchReadableStream);
        logger.info("<EOF>");
      } else {
        await sendStreamToFtp({
          fileName,
          readableStream: batchReadableStream,
        });
      }

      await prismaClient.paymentRequestBatchUnifvae.updateMany({
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

export async function generatePaymentRequestUnifvaeBatchCsvStream(
  itemsToSendIds: string[]
) {
  const RECORDS_PER_FETCH = 10;
  let skip = 0;
  const paymentRequestBatchesWaitingToBeSentStream = new Readable({
    objectMode: true,
    async read() {
      const results = await prismaClient.paymentRequestBatchUnifvae.findMany({
        where: { id: { in: itemsToSendIds } },
        skip,
        take: RECORDS_PER_FETCH,
        orderBy: { createdAt: "asc" },
      });

      results.length
        ? results.map((frb) => this.push(frb.content))
        : this.push(null);
      skip += RECORDS_PER_FETCH;
    },
  });

  const csvStream = csv.format({ headers: true, delimiter: ";" });
  return paymentRequestBatchesWaitingToBeSentStream.pipe(csvStream);
}

async function sendStreamToConsole(readable: Readable) {
  for await (const chunk of readable) {
    logger.info((chunk as Buffer).toString());
  }
}
