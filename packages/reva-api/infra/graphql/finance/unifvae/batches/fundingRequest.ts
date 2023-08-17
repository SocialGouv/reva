import { Readable } from "stream";

import { Feature, FundingRequestUnifvae } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";
import * as csv from "fast-csv";

import { sendStreamToFtp } from "../../../..//ftp/ftp";
import { prismaClient } from "../../../../database/postgres/client";
import { logger } from "../../../../logger";

const BATCH_KEY = "batch.demande-financement-unifvae";

const isFeatureActive = (feature: Feature | null) =>
  feature && feature.isActive;

const generateFundingRequestUnifvaeBatchCsvStream = async (
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

      results.length
        ? results.map((frb) => this.push(frb.content))
        : this.push(null);
      skip += RECORDS_PER_FETCH;
    },
  });

  const csvStream = csv.format({ headers: true, delimiter: ";" });
  return fundingRequestBatchesWaitingToBeSentStream.pipe(csvStream);
};

export const batchFundingRequestUnifvae = async () => {
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

    const batchReadableStream =
      await generateFundingRequestUnifvaeBatchCsvStream(itemsToSendIds);

    const fileDate = new Date().toLocaleDateString("sv").split("-").join("");
    const fileName = `DAF_${fileDate}.csv`;
    await sendStreamToFtp({
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
  } catch (e) {
    logger.error(
      `Une erreur est survenue lors de l'exécution du batch ${BATCH_KEY}`,
      e
    );
    e instanceof Error && logger.error(e.message);
  } finally {
    logger.info(`Batch ${BATCH_KEY} terminé`);
  }
};

export const createBatchFromFundingRequestUnifvae = async (
  fundingRequestId: string
) => {
  const fundingRequest =
    await prismaClient.fundingRequestUnifvae.findUniqueOrThrow({
      where: { id: fundingRequestId },
      include: {
        candidacy: {
          select: {
            certificationsAndRegions: {
              include: { certification: { select: { label: true } } },
            },
            organism: { select: { siret: true } },
          },
        },
        basicSkills: {
          select: { basicSkill: { select: { label: true } } },
        },
        mandatoryTrainings: {
          select: { training: { select: { label: true } } },
        },
      },
    });

  const formationObligatoire = fundingRequest.mandatoryTrainings.map(
    (t) => t.training.label
  );
  const savoirsDeBase = fundingRequest.basicSkills.map(
    (bs) => bs.basicSkill.label
  );

  const formationComplementaire = [
    {
      count: fundingRequest.basicSkillsHourCount,
      cost: fundingRequest.basicSkillsCost,
    },
    {
      count: fundingRequest.mandatoryTrainingsHourCount,
      cost: fundingRequest.mandatoryTrainingsCost,
    },
    {
      count: fundingRequest.certificateSkillsHourCount,
      cost: fundingRequest.certificateSkillsCost,
    },
    {
      count: fundingRequest.otherTrainingHourCount,
      cost: fundingRequest.otherTrainingCost,
    },
  ];

  const formationComplementaireHeures = formationComplementaire.reduce(
    (heures, fc) => heures.plus(fc.count),
    new Decimal(0)
  );
  const formationComplementaireCoutTotal = formationComplementaire.reduce(
    (totalCost, fc) => totalCost.plus(fc.cost.times(fc.count)),
    new Decimal(0)
  );

  // const formationComplementaireCoutMoyen =
  //   formationComplementaireCoutTotal.dividedBy(formationComplementaireHeures);

  return prismaClient.fundingRequestBatchUnifvae.create({
    data: {
      fundingRequestId: fundingRequest.id,
      content: {
        NumAction: fundingRequest.numAction,
        SiretAP: fundingRequest.candidacy?.organism?.siret,
        Certification:
          fundingRequest.candidacy?.certificationsAndRegions[0].certification
            .label,
        NomCandidat: fundingRequest.candidateLastname,
        PrenomCandidat1: fundingRequest.candidateFirstname,
        PrenomCandidat2: fundingRequest.candidateSecondname,
        PrenomCandidat3: fundingRequest.candidateThirdname,
        ActeFormatifComplémentaire_FormationObligatoire:
          formationObligatoire.join(", "),
        ActeFormatifComplémentaire_SavoirsDeBase: savoirsDeBase.join(", "),
        ActeFormatifComplémentaire_BlocDeCompetencesCertifiant:
          fundingRequest.certificateSkills,
        ActeFormatifComplémentaire_Autre: fundingRequest.otherTraining,
        NbHeureDemAccVAEInd: fundingRequest.individualHourCount.toFixed(2),
        CoutHeureDemAccVAEInd: fundingRequest.individualCost.toFixed(2),
        NbHeureDemAccVAEColl: fundingRequest.collectiveHourCount.toFixed(2),
        CoutHeureDemAccVAEColl: fundingRequest.collectiveCost.toFixed(2),
        NHeureDemActeFormatifCompl: formationComplementaireHeures.toFixed(2),
        CoutHeureDemActeFormatifCompl:
          formationComplementaireCoutTotal.toFixed(2),
        ForfaitPartiel: fundingRequest.isPartialCertification ? 1 : 0,
      },
    },
  });
};
