import path from "path";

import { $Enums, DossierDeValidationStatus } from "@prisma/client";
import dotenv from "dotenv";

import { prismaClient } from "../prisma/client";
import { createCertificationAuthorityHelper } from "../test/helpers/entities/create-certification-authority-helper";
import { createDossierDeValidationHelper } from "../test/helpers/entities/create-dossier-de-validation-helper";
import { createFeasibilityDematerializedHelper } from "../test/helpers/entities/create-feasibility-dematerialized-helper";
import { createJuryHelper } from "../test/helpers/entities/create-jury-helper";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const main = async () => {
  const certification = await prismaClient.certification.findFirst({
    select: { id: true },
  });

  if (!certification) {
    throw new Error("No certification found");
  }

  const certificationAuthority1 = await createCertificationAuthorityHelper({
    label: "Autorité de certification test 1",
  });

  const certificationAuthority2 = await createCertificationAuthorityHelper({
    label: "Autorité de certification test 2",
  });

  for (const feasibilityDecision of [
    "DRAFT",
    "PENDING",
    "REJECTED",
    "ADMISSIBLE",
    "INCOMPLETE",
    "COMPLETE",
  ] as $Enums.FeasibilityStatus[]) {
    const feasibility1 = await createFeasibilityDematerializedHelper({
      certificationAuthorityId: certificationAuthority1.id,
      decision: feasibilityDecision,
      decisionComment: "Un commentaire sur la décision",
      feasibilityFileSentAt: new Date(),
    });

    const feasibility2 = await createFeasibilityDematerializedHelper({
      certificationAuthorityId: certificationAuthority2.id,
      decision: feasibilityDecision,
      decisionComment: "Un commentaire sur la décision",
      feasibilityFileSentAt: new Date(),
    });

    if (feasibilityDecision !== "DRAFT") {
      await prismaClient.feasibilityDecision.create({
        data: {
          decision: "PENDING",
          decisionSentAt: new Date(),
          decisionComment: "Un commentaire sur la décision",
          feasibilityId: feasibility1.id,
        },
      });

      await prismaClient.feasibilityDecision.create({
        data: {
          decision: "INCOMPLETE",
          decisionSentAt: new Date(),
          decisionComment: "Un commentaire sur la décision",
          feasibilityId: feasibility1.id,
        },
      });

      await prismaClient.feasibilityDecision.create({
        data: {
          decision: "PENDING",
          decisionSentAt: new Date(),
          decisionComment: "Un commentaire sur la décision",
          feasibilityId: feasibility2.id,
        },
      });

      await prismaClient.feasibilityDecision.create({
        data: {
          decision: "INCOMPLETE",
          decisionSentAt: new Date(),
          decisionComment: "Un commentaire sur la décision",
          feasibilityId: feasibility2.id,
        },
      });
      if (
        feasibilityDecision !== "PENDING" &&
        feasibilityDecision !== "INCOMPLETE"
      ) {
        await prismaClient.feasibilityDecision.create({
          data: {
            decision: feasibilityDecision,
            decisionSentAt: new Date(),
            decisionComment: "Un commentaire sur la décision",
            feasibilityId: feasibility1.id,
          },
        });
        await prismaClient.feasibilityDecision.create({
          data: {
            decision: feasibilityDecision,
            decisionSentAt: new Date(),
            decisionComment: "Un commentaire sur la décision",
            feasibilityId: feasibility2.id,
          },
        });
      }
    }
  }

  const candidacyAdmissible1 = await prismaClient.candidacy.findMany({
    where: {
      Feasibility: {
        every: {
          decision: "ADMISSIBLE",
          certificationAuthorityId: certificationAuthority1.id,
        },
      },
    },
  });

  const candidacyAdmissible2 = await prismaClient.candidacy.findMany({
    where: {
      Feasibility: {
        every: {
          decision: "ADMISSIBLE",
          certificationAuthorityId: certificationAuthority2.id,
        },
      },
    },
  });

  if (!candidacyAdmissible1.length || !candidacyAdmissible2.length) {
    throw new Error("No admissible candidacy found");
  }

  for (const dvDecision of [
    "INCOMPLETE",
    "PENDING",
  ] as DossierDeValidationStatus[]) {
    await createDossierDeValidationHelper({
      candidacyId: candidacyAdmissible1[0].id,
      certificationAuthorityId: certificationAuthority1.id,
      decision: dvDecision,
      isActive: dvDecision === "PENDING",
    });

    await createDossierDeValidationHelper({
      candidacyId: candidacyAdmissible2[0].id,
      certificationAuthorityId: certificationAuthority2.id,
      decision: dvDecision,
      isActive: dvDecision === "PENDING",
    });
  }

  const pendingDv1 = await prismaClient.dossierDeValidation.findMany({
    where: {
      candidacyId: candidacyAdmissible1[0].id,
      certificationAuthorityId: certificationAuthority1.id,
      decision: "PENDING",
    },
  });

  const pendingDv2 = await prismaClient.dossierDeValidation.findMany({
    where: {
      candidacyId: candidacyAdmissible2[0].id,
      certificationAuthorityId: certificationAuthority2.id,
      decision: "PENDING",
    },
  });

  await createJuryHelper({
    candidacyId: pendingDv1[0].candidacyId,
    certificationAuthorityId: certificationAuthority1.id,
    result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
    dateOfSession: new Date(),
    addressOfSession: "Adresse de session 1",
    informationOfSession: "Information de session 1",
    dateOfResult: new Date(),
    informationOfResult: "Information de result 1",
  });
  await createJuryHelper({
    candidacyId: pendingDv2[0].candidacyId,
    certificationAuthorityId: certificationAuthority2.id,
    dateOfSession: new Date("2032-01-01"),
    addressOfSession: "Adresse de session 2",
    informationOfSession: "Information de session 2",
  });

  const degree = await prismaClient.degree.findFirst();
  if (!degree) {
    throw new Error("No degree found");
  }

  const france = await prismaClient.country.findFirst({
    where: {
      label: "France",
    },
  });

  await prismaClient.candidacy.updateMany({
    data: {
      certificationId: certification.id,
      isCertificationPartial: false,
    },
  });

  const candidacies = await prismaClient.candidacy.findMany({
    select: {
      id: true,
    },
  });

  for (const candidacy of candidacies) {
    await prismaClient.experience.create({
      data: {
        candidacyId: candidacy.id,
        title: "Experience 1",
        description: "Description 1",
        startedAt: new Date(),
        duration: "betweenOneAndThreeYears",
      },
    });
  }

  const hauteGaronne = await prismaClient.department.findFirst({
    where: {
      label: "Haute-Garonne",
    },
  });

  await prismaClient.candidate.updateMany({
    data: {
      highestDegreeId: degree.id,
      highestDegreeLabel: "Intitulé du diplôme le plus élevé",
      countryId: france?.id,
      birthDepartmentId: hauteGaronne?.id,
    },
  });
};

main();
