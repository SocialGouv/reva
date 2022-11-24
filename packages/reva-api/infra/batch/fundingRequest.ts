import { Transform } from "stream";

// import { Feature } from "@prisma/client";
import * as csv from "fast-csv";
import pino from "pino";
import Client from "ssh2-sftp-client";

// import { prismaClient } from "../database/postgres/client";

const BATCH_KEY = "batch.demande-financement";
const logger = pino();

// const isFeatureActive = (feature: Feature | null) =>
//   feature && feature.isActive;

export const batchFundingRequest = async () => {
  try {
    // Check if the feature is active
    // const fundingRequestFeature = await prismaClient.feature.findFirst({
    //   where: {
    //     key: BATCH_KEY,
    //   },
    // });

    // if (!isFeatureActive(fundingRequestFeature)) {
    //   logger.info(`Le batch ${BATCH_KEY} est inactif.`);
    //   return;
    // }

    // Start the execution
    // const batchExecution = await prismaClient.batchExecution.create({
    //   data: {
    //     key: BATCH_KEY,
    //     startedAt: new Date(Date.now()),
    //   },
    // });

    // TODO: Do some stuff here

    // Create Stream, Writable AND Readable
    logger.info(`SFTP ${process.env.SFTP_HOST}:${process.env.SFTP_PORT}`);
    const sftp = new Client();
    await sftp.connect({
      host: process.env.SFTP_HOST || "127.0.0.1",
      port: parseInt(process.env.SFTP_PORT || "2222", 10),
      username: process.env.SFTP_USERNAME || "demo",
      password: process.env.SFTP_PASSWORD || "demo",
      debug: logger.debug,
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

    await sftp.put(inoutStream, `Imports/DAF-${fileDate}.test.csv`);
    logger.info("open put stream done");
    await sftp.end();

    // const ws = sftp.createWriteStream("/home/demo/sftp/Imports/test.csv");

    // Finish the execution
    // await prismaClient.batchExecution.update({
    //   where: {
    //     id: batchExecution.id,
    //   },
    //   data: {
    //     finishedAt: new Date(Date.now()),
    //   },
    // });
  } catch (e: any) {
    logger.error(e.message);
    logger.error(
      `Une erreur est survenue lors de l'exécution du batch ${BATCH_KEY}`,
      e
    );
  } finally {
    logger.info(`Batch ${BATCH_KEY} terminé`);
  }
};
