import { Transform } from "stream";

import { Feature } from "@prisma/client";
import * as csv from "fast-csv";
import Client from "ftp-ts";
import pino from "pino";

import { prismaClient } from "../database/postgres/client";

const BATCH_KEY = "batch.demande-financement";
const logger = pino();

const isFeatureActive = (feature: Feature | null) =>
  feature && feature.isActive;

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

    // Create Stream, Writable AND Readable
    logger.info(`FTPS ${process.env.FTPS_HOST}:${process.env.FTPS_PORT}`);
    const connexion = await Client.connect({
      host: process.env.FTPS_HOST || "127.0.0.1",
      port: parseInt(process.env.FTPS_PORT || "2121", 10),
      user: process.env.FTPS_USERNAME || "reva",
      password: process.env.FTPS_PASSWORD || "password",
      secure: true,
      debug: console.log,
    });

    const inoutStream = new Transform({
      transform(chunk, encoding, callback) {
        this.push(chunk);
        callback();
      },
    });
    logger.info("open put stream");

    const csvStream = csv.format({ headers: true });

    csvStream.pipe(inoutStream).on("end", () => logger.info("csv done"));

    csvStream.write({
      NumAction: "",
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
      CoutTotalDemande: "",
    });
    csvStream.end();

    const fileDate = new Date().toLocaleDateString("sv").split("-").join("");

    await connexion.put(inoutStream, `import/DAF-${fileDate}.test.csv`);
    logger.info("open put stream done");
    await connexion.end();

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
