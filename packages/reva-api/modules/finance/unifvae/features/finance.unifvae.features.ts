import { Candidate } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { format } from "date-fns";

import { prismaClient } from "../../../../prisma/client";
import { updateCandidacyStatus } from "../../../candidacy/database/candidacies";
import { UploadedFile } from "../../../shared/file";
import applyBusinessValidationRules from "../validation";
import { createBatchFromFundingRequestUnifvae } from "./fundingRequestBatch";

export const createFundingRequestUnifvae = async ({
  candidacyId,
  isCertificationPartial,
  fundingRequest,
}: FundingRequestUnifvaeInputCompleted) => {
  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
    select: {
      financeModule: true,
      basicSkills: true,
      trainings: true,
      otherTraining: true,
      certificateSkills: true,
      candidate: true,
    },
  });
  if (candidacy === null) {
    throw new Error(`Candidacy ${candidacyId} not found`);
  }
  const fundreq = await prismaClient.fundingRequestUnifvae.create({
    data: {
      candidacyId,
      numAction: await getNextNumAction(),
      otherTraining: candidacy.otherTraining ?? "",
      certificateSkills: candidacy.certificateSkills ?? "",
      ...fundingRequest,
      isPartialCertification: isCertificationPartial,
      candidateFirstname: candidacy.candidate?.firstname,
      candidateLastname: candidacy.candidate?.lastname,
    },
  });

  await prismaClient.$transaction([
    prismaClient.basicSkillOnFundingRequestsUnifvae.createMany({
      data: candidacy.basicSkills.map(({ basicSkillId }) => ({
        basicSkillId,
        fundingRequestUnifvaeId: fundreq.id,
      })),
    }),
    prismaClient.trainingOnFundingRequestsUnifvae.createMany({
      data: candidacy.trainings.map(({ trainingId }) => ({
        trainingId,
        fundingRequestUnifvaeId: fundreq.id,
      })),
    }),
    prismaClient.candidate.update({
      where: { id: (candidacy.candidate as Candidate).id },
      data: {
        gender: fundingRequest.candidateGender,
        firstname2: fundingRequest.candidateSecondname,
        firstname3: fundingRequest.candidateThirdname,
      },
    }),
  ]);
  await updateCandidacyStatus({
    candidacyId,
    status: "DEMANDE_FINANCEMENT_ENVOYE",
  });

  await createBatchFromFundingRequestUnifvae(fundreq.id);

  return prismaClient.fundingRequestUnifvae.findUnique({
    where: {
      id: fundreq.id,
    },
    include: {
      basicSkills: {
        select: {
          basicSkill: true,
        },
      },
      mandatoryTrainings: {
        select: {
          training: true,
        },
      },
    },
  });
};

export const getFundingRequestUnifvaeFromCandidacyId = async (
  candidacyId: string,
) =>
  prismaClient.fundingRequestUnifvae.findFirst({
    where: { candidacyId },
    include: {
      basicSkills: { include: { basicSkill: true } },
      mandatoryTrainings: { include: { training: true } },
    },
  });

async function getNextNumAction() {
  const nextValQueryResult =
    (await prismaClient.$queryRaw`Select nextval('funding_request_unifvae_num_action_sequence')`) as {
      nextval: number;
    }[];
  return `reva_${format(new Date(), "yyyyMMdd")}_${nextValQueryResult[0].nextval
    .toString()
    .padStart(5, "0")}`;
}

export const getPaymentRequestUnifvaeFromCandidacyId = (candidacyId: string) =>
  prismaClient.paymentRequestUnifvae.findFirst({
    where: { candidacyId },
  });

export const createOrUpdatePaymentRequestUnifvae = async ({
  candidacyId,
  paymentRequest,
}: {
  candidacyId: string;
  paymentRequest: PaymentRequestUnifvaeInput;
}) => {
  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
  });
  if (!candidacy) {
    throw new Error(
      "Impossible de créer la demande de paiement. La candidature n'a pas été trouvée",
    );
  }

  if (
    candidacy.isCertificationPartial == undefined ||
    candidacy.isCertificationPartial == null
  ) {
    throw new Error('"isCertificationPartial" has not been set');
  }

  const validationErrors = await applyBusinessValidationRules({
    candidacyId,
    isCertificationPartial: candidacy.isCertificationPartial,
    individualHourCount: paymentRequest.individualEffectiveHourCount,
    collectiveHourCount: paymentRequest.collectiveEffectiveHourCount,
    basicSkillsHourCount: paymentRequest.basicSkillsEffectiveHourCount,
    mandatoryTrainingsHourCount:
      paymentRequest.mandatoryTrainingsEffectiveHourCount,
    certificateSkillsHourCount:
      paymentRequest.certificateSkillsEffectiveHourCount,
    otherTrainingHourCount: paymentRequest.otherTrainingEffectiveHourCount,
    individualCost: paymentRequest.individualEffectiveCost,
    collectiveCost: paymentRequest.collectiveEffectiveCost,
    basicSkillsCost: paymentRequest.basicSkillsEffectiveCost,
    mandatoryTrainingsCost: paymentRequest.mandatoryTrainingsEffectiveCost,
    certificateSkillsCost: paymentRequest.certificateSkillsEffectiveCost,
    otherTrainingCost: paymentRequest.otherTrainingEffectiveCost,
  });

  if (validationErrors.length) {
    const businessErrors = validationErrors.map(({ fieldName, message }) =>
      fieldName === "GLOBAL" ? message : `input.${fieldName}: ${message}`,
    );
    throw new Error(businessErrors[0]);
  }

  return prismaClient.paymentRequestUnifvae.upsert({
    where: { candidacyId },
    create: {
      candidacyId,
      ...paymentRequest,
      invoiceNumber: paymentRequest.invoiceNumber || "",
    },
    update: {
      ...paymentRequest,
    },
  });
};

export const addUploadedFileAndConfirmPayment = async ({
  candidacyId,
  invoiceFile,
  certificateOfAttendanceFile,
}: {
  candidacyId: string;
  invoiceFile: UploadedFile;
  certificateOfAttendanceFile: UploadedFile;
}) => {
  await addUploadedFileToPaymentRequestUnifvae({
    candidacyId,
    invoiceFile,
    certificateOfAttendanceFile,
  });
  await confirmPaymentRequestUnifvae({ candidacyId });
};

const confirmPaymentRequestUnifvae = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const candidacy = await prismaClient.candidacy.findFirst({
    where: { id: candidacyId },
    include: {
      fundingRequestUnifvae: true,
      paymentRequestUnifvae: true,
      organism: true,
    },
  });

  if (!candidacy) {
    throw new Error(
      "Impossible de confirmer la demande de paiement. La candidature n'a pas été trouvée",
    );
  }

  const fundingRequest = candidacy?.fundingRequestUnifvae[0];

  if (!fundingRequest) {
    throw new Error(
      "Impossible de confirmer la demande de paiement. La demande de financement n'a pas été trouvée",
    );
  }

  const paymentRequest = candidacy?.paymentRequestUnifvae;

  if (!paymentRequest) {
    throw new Error(
      "Impossible de confirmer la demande de paiement. La demande de paiment n'a pas été trouvée",
    );
  }

  const formationComplementaireHeures =
    paymentRequest.basicSkillsEffectiveHourCount
      .plus(paymentRequest.mandatoryTrainingsEffectiveHourCount)
      .plus(paymentRequest.certificateSkillsEffectiveHourCount)
      .plus(paymentRequest.otherTrainingEffectiveHourCount);

  const formationComplementaireCoutTotal =
    paymentRequest.basicSkillsEffectiveHourCount
      .mul(paymentRequest.basicSkillsEffectiveCost)
      .plus(
        paymentRequest.mandatoryTrainingsEffectiveHourCount.mul(
          paymentRequest.mandatoryTrainingsEffectiveCost,
        ),
      )
      .plus(
        paymentRequest.certificateSkillsEffectiveHourCount.mul(
          paymentRequest.certificateSkillsEffectiveCost,
        ),
      )
      .plus(
        paymentRequest.otherTrainingEffectiveHourCount.mul(
          paymentRequest.otherTrainingEffectiveCost,
        ),
      );

  const formationComplementaireCoutHoraireMoyen =
    formationComplementaireHeures.isZero()
      ? new Decimal(0)
      : formationComplementaireCoutTotal.dividedBy(
          formationComplementaireHeures,
        );

  await prismaClient.paymentRequestBatchUnifvae.create({
    data: {
      paymentRequestUnifvaeId: paymentRequest.id,
      content: {
        SiretAP: candidacy?.organism?.siret,
        NumAction: fundingRequest.numAction,
        NumFacture: paymentRequest.invoiceNumber,
        NbHeureReaAccVAEInd:
          paymentRequest.individualEffectiveHourCount.toFixed(2),
        CoutHeureReaAccVAEInd:
          paymentRequest.individualEffectiveCost.toFixed(2),
        NbHeureReaAccVAEColl:
          paymentRequest.collectiveEffectiveHourCount.toFixed(2),
        CoutHeureReaAccVAEColl:
          paymentRequest.collectiveEffectiveCost.toFixed(2),
        NbHeureReaDemActeFormatifCompl:
          formationComplementaireHeures.toFixed(2),
        CoutHeureReaDemActeFormatifCompl:
          formationComplementaireCoutHoraireMoyen.toFixed(2, Decimal.ROUND_UP),
      },
    },
  });

  await updateCandidacyStatus({
    candidacyId,
    status: "DEMANDE_PAIEMENT_ENVOYEE",
  });
  return paymentRequest;
};

const addUploadedFileToPaymentRequestUnifvae = async ({
  candidacyId,
  invoiceFile,
  certificateOfAttendanceFile,
}: {
  candidacyId: string;
  invoiceFile: UploadedFile;
  certificateOfAttendanceFile: UploadedFile;
}) => {
  const paymentRequest = await prismaClient.paymentRequestUnifvae.findFirst({
    where: { candidacyId },
  });

  if (!paymentRequest) {
    throw new Error("Demande de paiement non trouvée");
  }

  const fundingRequest = await prismaClient.fundingRequestUnifvae.findFirst({
    where: { candidacyId },
  });

  if (!fundingRequest) {
    throw new Error("Demande de financement non trouvée");
  }

  await prismaClient.fileUploadSpooler.createMany({
    data: [
      {
        destinationFileName: `facture_${
          fundingRequest.numAction
        }.${getFilenameExtension(invoiceFile.filename)}`,
        destinationPath: "import",
        description: `Facture pour paymentRequestId ${paymentRequest.id} (${invoiceFile.filename} - ${invoiceFile.mimetype})`,
        fileContent: invoiceFile._buf,
      },
      {
        destinationFileName: `presence_${
          fundingRequest.numAction
        }.${getFilenameExtension(certificateOfAttendanceFile.filename)}`,
        destinationPath: "import",
        description: `Feuille de présence pour paymentRequestId ${paymentRequest.id} (${certificateOfAttendanceFile.filename} - ${certificateOfAttendanceFile.mimetype})`,
        fileContent: certificateOfAttendanceFile._buf,
      },
    ],
  });
};

function getFilenameExtension(filename: string) {
  return filename.split(".").pop();
}
