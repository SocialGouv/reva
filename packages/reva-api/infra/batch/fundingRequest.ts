import { Readable, Transform } from "stream";

import { Feature } from "@prisma/client";
import * as csv from "fast-csv";
import Client from "ftp-ts";
import pino from "pino";

import { prismaClient } from "../database/postgres/client";
import * as mattermost from "../mattermost";

const BATCH_KEY = "batch.demande-financement";
const logger = pino();

const isFeatureActive = (feature: Feature | null) =>
  feature && feature.isActive;

const generateFundingRequestBatchCsvStream = async () => {
  const RECORDS_PER_FETCH = 10;
  let skip = 0;
  const fundingRequestBatchesWaitingToBeSentStream = new Readable({
    objectMode: true,
    async read() {
      const results = await prismaClient.fundingRequestBatch.findMany({
        where: { sent: false },
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

    const inoutStream = new Transform({
      transform(chunk, encoding, callback) {
        this.push(chunk);
        callback();
      },
    });

    // Start the execution
    const batchExecution = await prismaClient.batchExecution.create({
      data: {
        key: BATCH_KEY,
        startedAt: new Date(Date.now()),
      },
    });

    // TODO Generate CSV Stream
    const csvStream = csv.format({ headers: true });

    csvStream.pipe(inoutStream).on("end", () => logger.info("csv done"));

    csvStream.write({
      NumAction: "1",
      NomAP: "",
      SiretAP: "",
      CertificationVisée: "",
      NomCandidat: "",
      PrenomCandidat1: "",
      PrenomCandidat2: "",
      PrenomCandidat3: "",
      GenreCandidat: "",
      NiveauObtenuCandidat: "",
      IndPublicFragile: "",
      NbHeureDemAPDiag: "",
      CoutHeureDemAPDiag: "",
      NbHeureDemAPPostJury: "",
      CoutHeureDemAPPostJury: "",
      AccompagnateurCandidat: "",
      NbHeureDemAccVAEInd: "",
      CoutHeureDemAccVAEInd: "",
      NbHeureDemAccVAEColl: "",
      CoutHeureDemAccVAEColl: "",
      ActeFormatifComplémentaire_FormationObligatoire: "",
      NbHeureDemComplFormObligatoire: "",
      CoutHeureDemComplFormObligatoire: "",
      ActeFormatifComplémentaire_SavoirsDeBase: "",
      NbHeureDemComplFormSavoirsDeBase: "",
      CoutHeureDemComplFormSavoirsDeBase: "",
      ActeFormatifComplémentaire_BlocDeCompetencesCertifiant: "",
      NbHeureDemComplFormBlocDeCompetencesCertifiant: "",
      CoutHeureDemComplFormBlocDeCompetencesCertifiant: "",
      ActeFormatifComplémentaire_Autre: "",
      NombreHeureTotalActesFormatifs: "",
      NbHeureDemJury: "",
      CoutHeureJury: "",
      CoutTotalDemande: "1",
    });
    csvStream.end();

    // End Generate CSV Stream

    const fileDate = new Date().toLocaleDateString("sv").split("-").join("");
    const fileName = `DAF-${fileDate}.csv`;
    sendFundingRequestsStream({ fileName, readableStream: inoutStream });

    // Finish the execution
    await prismaClient.batchExecution.update({
      where: {
        id: batchExecution.id,
      },
      data: {
        finishedAt: new Date(Date.now()),
      },
    });
  } catch (e: Error) {
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
  if (process.env.BATCH_FUNDING_REQUEST_TARGET === "ftps") {
    await sendStreamToFTPS(params);
  } else {
    await sendStreamToMattermost(params);
  }
}

async function sendStreamToFTPS(params: {
  fileName: string;
  readableStream: NodeJS.ReadableStream;
}) {
  logger.info(`FTPS ${process.env.FTPS_HOST}:${process.env.FTPS_PORT}`);
  const connexion = await Client.connect({
    host: process.env.FTPS_HOST || "127.0.0.1",
    port: parseInt(process.env.FTPS_PORT || "2121", 10),
    user: process.env.FTPS_USERNAME || "reva",
    password: process.env.FTPS_PASSWORD || "password",
    secure: true,
    debug: console.log,
  });
  await connexion.put(params.readableStream, `import/${params.fileName}`);
  logger.info("Stream sent");
  connexion.end();
}

async function sendStreamToMattermost(params: {
  fileName: string;
  readableStream: NodeJS.ReadableStream;
}) {
  const rows: string[][] = [];
  params.readableStream
    .on("data", (chunk) => {
      const [_, ...row] = Buffer.from(chunk).toString("utf8").split(",");
      rows.push(row);
    })
    .on("end", () => {
      const [headers, ...contentRows] = rows;
      mattermost.sendDataTable({
        title: `Demande de financement - ${params.fileName}`,
        headers,
        rows: contentRows,
      });
    });
}
