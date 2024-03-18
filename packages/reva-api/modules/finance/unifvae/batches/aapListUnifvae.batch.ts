import { Readable } from "stream";

import * as csv from "fast-csv";

import { prismaClient } from "../../../../prisma/client";
import { logger } from "../../../shared/logger";
import { sendStreamToFtp } from "../../shared/ftp";

export const batchAapListUnifvae = async (batchKey: string) => {
  try {
    // Start the execution
    const batchExecution = await prismaClient.batchExecution.create({
      data: {
        key: batchKey,
        startedAt: new Date(Date.now()),
      },
    });

    const itemsToSendIds = (
      await prismaClient.maisonMereAAP.findMany({
        select: { id: true },
      })
    ).map((v) => v.id);

    if (itemsToSendIds.length === 0) {
      logger.info("Found no aap to process.");
    } else {
      const fileDate = new Date().toLocaleDateString("sv").split("-").join("");
      const fileName = `ARCHITECT_${fileDate}.csv`;

      const batchReadableStream = await generateCsvStream(itemsToSendIds);

      if (process.env.APP_ENV !== "production") {
        logger.info(`Writing aap_list_unifvae batch to "${fileName}"`);
        await sendStreamToConsole(batchReadableStream);
        logger.info("<EOF>");
      } else {
        await sendStreamToFtp({
          fileName,
          readableStream: batchReadableStream,
        });
      }
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

export async function generateCsvStream(itemsToSendIds: string[]) {
  const RECORDS_PER_FETCH = 10;
  let skip = 0;
  const stream = new Readable({
    objectMode: true,
    async read() {
      const results = await prismaClient.maisonMereAAP.findMany({
        where: { id: { in: itemsToSendIds } },
        include: { gestionnaire: true },
        skip,
        take: RECORDS_PER_FETCH,
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      });

      results.length
        ? results.map((mmaap) =>
            this.push({
              SIRET: mmaap.siret,
              Nom: mmaap.raisonSociale,
              email: mmaap.gestionnaire.email,
              Adresse_NomVoie: mmaap.adresse,
              Adresse_Ville: mmaap.ville,
              Adresse_CodePostal: mmaap.codePostal,
            })
          )
        : this.push(null);
      skip += RECORDS_PER_FETCH;
    },
  });

  const csvStream = csv.format({ headers: true, delimiter: ";" });
  return stream.pipe(csvStream);
}

async function sendStreamToConsole(readable: Readable) {
  for await (const chunk of readable) {
    logger.info((chunk as Buffer).toString());
  }
}
