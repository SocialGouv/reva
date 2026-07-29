import { Candidate, Department } from "@prisma/client";
import { isBefore, sub } from "date-fns";

import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { CandidateUpdateInput } from "@/modules/candidate/candidate.types";
import { refreshCertificationAuthorityOfCandidacy } from "@/modules/certification-authority/features/refreshCertificationAuthorityOfCandidacy";
import { generateAndUploadFeasibilityFileByCandidacyId } from "@/modules/feasibility/dematerialized-feasibility-file/features/generateAndUploadFeasibilityFileByCandidacyId";
import { CANDIDAT_NON_TROUVE } from "@/modules/shared/errors/messages";
import { logger } from "@/modules/shared/logger/logger";
import { prismaClient } from "@/prisma/client";

import { updateCandidateEmailAndSendNotifications } from "./updateCandidateEmailAndSendNotifications";

export const updateCandidate = async ({
  params: { candidate, userRoles, userKeycloakId, userEmail },
}: {
  params: { candidate: Partial<CandidateUpdateInput> & { id: string } } & {
    userKeycloakId?: string;
    userEmail?: string;
    userRoles: KeyCloakUserRole[];
  };
}): Promise<Candidate> => {
  const candidateInput = { ...candidate };
  const candidateToUpdate = await prismaClient.candidate.findUnique({
    where: { id: candidateInput.id },
    include: { department: true },
  });

  if (!candidateToUpdate) {
    throw new Error(CANDIDAT_NON_TROUVE);
  }

  if (candidateInput.email) {
    const candidateWithEmail = await prismaClient.candidate.findUnique({
      where: { email: candidateInput.email },
    });

    if (candidateWithEmail && candidateWithEmail.id != candidateToUpdate.id) {
      throw new Error(
        `Vous ne pouvez pas utiliser ${candidateInput.email} comme nouvelle adresse électronique`,
      );
    }
  }

  // Protéger les champs pivots pour les candidats liés à FranceConnect
  if (candidateToUpdate.franceConnectLinked) {
    const candidateCountry = candidateToUpdate.countryId
      ? await prismaClient.country.findUnique({
          where: { id: candidateToUpdate.countryId },
        })
      : null;
    const countryIsFrance = candidateCountry?.label === "France";

    delete candidateInput.lastname;
    delete candidateInput.firstname;
    delete candidateInput.firstname2;
    delete candidateInput.firstname3;
    delete candidateInput.middleNames;
    delete candidateInput.birthdate;
    delete candidateInput.countryId;

    // Pour un candidat FC né hors de France, on force birthDepartmentId à null
    // uniquement si l'appelant a explicitement inclus ce champ dans le payload :
    // countryId vient d'être supprimé donc le bloc de normalisation plus bas ne peut
    // plus le faire. On n'injecte pas de null pour un champ que l'appelant n'a pas
    // touché (important pour updateCandidateInformationBySelf qui accepte des updates
    // partiels).
    if (!countryIsFrance) {
      if ("birthDepartmentId" in candidateInput) {
        candidateInput.birthDepartmentId = null;
      }
    } else if (candidateInput.birthDepartmentId) {
      // Le bloc de normalisation plus bas ne s'exécute que si countryId est présent dans l'input,
      // or on vient de le supprimer. On valide donc ici le birthDepartmentId pour renvoyer une
      // erreur métier propre plutôt que de laisser la contrainte Prisma/FK remonter une 500.
      const birthDepartmentSelected = await prismaClient.department.findUnique({
        where: { id: candidateInput.birthDepartmentId },
      });

      if (!birthDepartmentSelected) {
        throw new Error(`Le département de naissance n'existe pas`);
      }
    }
  }

  if (candidateInput.countryId) {
    const countrySelected =
      (await prismaClient.country.findUnique({
        where: { id: candidateInput.countryId },
      })) ?? undefined;
    if (!countrySelected) {
      throw new Error(`Le pays n'existe pas`);
    }

    if (
      countrySelected.label === "France" &&
      candidateInput.birthDepartmentId
    ) {
      const birthDepartmentSelected = await prismaClient.department.findUnique({
        where: { id: candidateInput.birthDepartmentId },
      });

      if (!birthDepartmentSelected) {
        throw new Error(`Le département de naissance n'existe pas`);
      }
    } else {
      candidateInput.birthDepartmentId = null;
    }
  }

  const isNewZip =
    candidateToUpdate.zip === null ||
    candidateToUpdate.zip !== candidateInput.zip;

  if (isNewZip && candidateInput.zip?.match(/^\d{5}$/)) {
    const department = await getDepartmentFromZipCode(candidateInput.zip);
    if (!department) {
      throw new Error(`Le département n'existe pas`);
    }

    candidateInput.departmentId = department.id;
  }

  const today = new Date();

  if (candidateInput.birthdate) {
    const dateSelected = new Date(Number(candidateInput.birthdate));
    const sixteenYearsAgo = sub(today, { years: 16 });
    const candidateBirthdayIsOlderThan16YearsAgo = isBefore(
      dateSelected,
      sixteenYearsAgo,
    );
    if (!candidateBirthdayIsOlderThan16YearsAgo) {
      throw new Error(`Le candidat doit avoir plus de 16 ans`);
    }
  }

  const previousEmail = candidateToUpdate.email;
  const newEmail = candidateInput.email;

  if (
    newEmail &&
    newEmail !== previousEmail &&
    (userRoles.includes("admin") || userRoles.includes("candidate"))
  ) {
    await updateCandidateEmailAndSendNotifications({
      previousEmail,
      newEmail,
    });
  }

  const candidacies = await prismaClient.candidacy.findMany({
    where: { candidateId: candidateInput.id },
    select: {
      id: true,
      Feasibility: {
        where: {
          isActive: true,
        },
        select: {
          feasibilityFileSentAt: true,
          dematerializedFeasibilityFile: {
            select: {
              feasibilityFileId: true,
            },
          },
        },
      },
    },
  });

  await Promise.all(
    candidacies.map(async (c) =>
      logCandidacyAuditEvent({
        candidacyId: c.id,
        eventType: "CANDIDATE_UPDATED",
        userKeycloakId,
        userEmail,
        userRoles,
      }),
    ),
  );

  const candidateDepartmentChanged =
    candidateInput.departmentId !== candidateToUpdate.departmentId;

  const candidaciesWithoutFeasibility = candidacies.filter(
    (c) => !c.Feasibility?.[0] || !c.Feasibility?.[0]?.feasibilityFileSentAt,
  );

  const [updatedCandidate] = await prismaClient.$transaction([
    prismaClient.candidate.update({
      where: { id: candidateInput.id },
      data: {
        ...candidateInput,
      },
    }),
    prismaClient.candidacyCandidateInfo.deleteMany({
      where: {
        candidacyId: { in: candidaciesWithoutFeasibility.map((c) => c.id) },
      },
    }),
    prismaClient.candidacyCandidateInfo.createMany({
      data: candidaciesWithoutFeasibility.map((c) => ({
        candidacyId: c.id,
        street: candidateInput.street,
        city: candidateInput.city,
        zip: candidateInput.zip,
        addressComplement: candidateInput.addressComplement,
      })),
    }),
  ]);

  //Si le candidat a changé de département on refresh la certification authority de toutes ses candidatures (le refresh ne se fera que si la candidature est dans un statut qui le permet)
  //Ce refresh doit avoir lieu après la transaction ci-dessus pour que le nouveau département du candidat soit bien pris en compte
  if (candidateDepartmentChanged) {
    await Promise.all(
      candidacies.map((c) =>
        refreshCertificationAuthorityOfCandidacy({ candidacyId: c.id }),
      ),
    );
  }

  await Promise.all(
    // On régénère le pdf du dossier de faisabilité de toutes les candidatures pour lesquelles le DF n'a pas été envoyé
    candidacies.map(async (c) => {
      if (
        c.Feasibility?.[0]?.dematerializedFeasibilityFile?.feasibilityFileId &&
        !c.Feasibility?.[0]?.feasibilityFileSentAt
      ) {
        logger.info(`Updating feasibility PDF file for candidacy ${c.id}...`);
        try {
          await generateAndUploadFeasibilityFileByCandidacyId(c.id);
          logger.info(`Feasibility PDF file updated for candidacy ${c.id}`);
        } catch (e) {
          logger.error(
            `Error updating feasibility PDF file for candidacy ${c.id}: ${e?.toString()}`,
          );
        }
      }
    }),
  );

  return updatedCandidate;
};

const getDepartmentFromZipCode = async (
  zipCode: string,
): Promise<Department | undefined> => {
  // Check for Corse
  if (zipCode.startsWith("20")) {
    const parsedZipCode = parseInt(zipCode, 10);
    const corseDepartment = await prismaClient.department.findUnique({
      where: { code: parsedZipCode < 20200 ? "2A" : "2B" },
    });
    if (corseDepartment) {
      return corseDepartment;
    }
  }

  // Check full digits (used for 97150)
  const departmentWillFullDigits = await prismaClient.department.findUnique({
    where: { code: zipCode },
  });
  if (departmentWillFullDigits) {
    return departmentWillFullDigits;
  }

  // Check 2 digits
  const zipWith2Digits = zipCode?.slice(0, 2);
  const departmentWith2Digits = await prismaClient.department.findUnique({
    where: { code: zipWith2Digits },
  });
  if (departmentWith2Digits) {
    return departmentWith2Digits;
  }

  // Check 3 digits
  const zipWith3Digits = zipCode?.slice(0, 3);
  const departmentWith3Digits = await prismaClient.department.findUnique({
    where: { code: zipWith3Digits },
  });
  if (departmentWith3Digits) {
    return departmentWith3Digits;
  }

  return undefined;
};
