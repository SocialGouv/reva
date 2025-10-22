import { Candidate, Department } from "@prisma/client";
import { isBefore, sub } from "date-fns";

import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { CandidateUpdateInput } from "@/modules/candidate/candidate.types";
import { generateAndUploadFeasibilityFileByCandidacyId } from "@/modules/feasibility/dematerialized-feasibility-file/features/generateAndUploadFeasibilityFileByCandidacyId";
import { logger } from "@/modules/shared/logger/logger";
import { prismaClient } from "@/prisma/client";

import { updateCandidateEmailAndSendNotifications } from "./updateCandidateEmailAndSendNotifications";

export const updateCandidate = async ({
  params: { candidate, userRoles, userKeycloakId, userEmail },
}: {
  params: { candidate: Partial<CandidateUpdateInput> } & {
    userKeycloakId?: string;
    userEmail?: string;
    userRoles: KeyCloakUserRole[];
  };
}): Promise<Candidate> => {
  const candidateInput = { ...candidate };
  const { id, email, birthDepartmentId, countryId } = candidateInput;
  const candidateToUpdate = await prismaClient.candidate.findUnique({
    where: { id },
    include: { department: true },
  });

  if (!candidateToUpdate) {
    throw new Error(`Ce candidat n'existe pas`);
  }

  const candidateWithEmail = await prismaClient.candidate.findUnique({
    where: { email },
  });

  if (candidateWithEmail && candidateWithEmail.id != candidateToUpdate.id) {
    throw new Error(
      `Vous ne pouvez pas utiliser ${email} comme nouvelle adresse électronique`,
    );
  }

  if (birthDepartmentId) {
    const birthDepartmentSelected = await prismaClient.department.findUnique({
      where: { id: birthDepartmentId },
    });

    if (!birthDepartmentSelected) {
      throw new Error(`Le département de naissance n'existe pas`);
    }
  } else {
    delete candidateInput.birthDepartmentId;
  }

  const countrySelected = await prismaClient.country.findUnique({
    where: { id: countryId },
  });

  if (!countrySelected) {
    throw new Error(`Le pays n'existe pas`);
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
    const dateSelected = new Date(Number(candidate.birthdate));
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
  const newEmail = email;

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
    where: { candidateId: id },
    include: {
      Feasibility: {
        where: {
          isActive: true,
        },
        include: {
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

  const updatedCandidate = await prismaClient.candidate.update({
    where: { id },
    data: {
      ...candidateInput,
      birthDepartmentId:
        countrySelected.label == "France" ? birthDepartmentId : undefined,
    },
  });

  await Promise.all(
    candidacies.map(async (c) => {
      if (
        c.Feasibility?.[0]?.dematerializedFeasibilityFile?.feasibilityFileId
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
