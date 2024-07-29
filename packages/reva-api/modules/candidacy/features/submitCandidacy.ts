import { CandidacyStatusStep } from "@prisma/client";

import {
  sendConfirmationCandidacySubmissionEmail,
  sendNewCandidacyEmail,
} from "../mails";
import { existsCandidacyWithActiveStatus } from "./existsCandidacyWithActiveStatus";
import { getCandidacyById } from "./getCandidacyById";
import { getCandidateById } from "./getCandidateById";
import { getReferentOrganismFromCandidacyId } from "./getReferentOrganismFromCandidacyId";
import { updateCandidacyStatus } from "./updateCandidacyStatus";
import { getCandidacyCertification } from "./getCandidacyCertification";
import { prismaClient } from "../../../prisma/client";

export const submitCandidacy = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const candidacy = await getCandidacyById({
    candidacyId,
  });
  if (!candidacy) {
    throw new Error(`Aucune candidature n'a été trouvée`);
  }

  const validateCandidacyNotAlreadySubmitted =
    await existsCandidacyWithActiveStatus({
      candidacyId,
      status: CandidacyStatusStep.PROJET,
    });

  if (!validateCandidacyNotAlreadySubmitted) {
    throw new Error(`Cette candidature a déjà été soumise`);
  }

  const candidate = await getCandidateById({
    candidateId: candidacy.candidateId as string,
  });

  if (!candidate) {
    throw new Error(
      `Impossible de trouver le candidat ${candidacy.candidateId}`,
    );
  }

  const certification = await getCandidacyCertification({ candidacyId });

  if (!certification) {
    throw new Error(
      `Impossible de trouver la certification pour la candidature ${candidacyId}`,
    );
  }

  await prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: { financeModule: "unifvae" },
  });

  const updatedCandidacy = await updateCandidacyStatus({
    candidacyId,
    status: CandidacyStatusStep.VALIDATION,
  });

  const organism = await getReferentOrganismFromCandidacyId({ candidacyId });

  if (!organism) {
    throw new Error(
      `Impossible de trouver l'organisme pour la candidature ${candidacy.id}`,
    );
  }
  await sendNewCandidacyEmail({ email: organism.contactAdministrativeEmail });
  await sendConfirmationCandidacySubmissionEmail({
    email: candidate.email as string,
    organismName: organism.label,
    organismEmail: organism.contactAdministrativeEmail,
    candidacyFundedByFranceVae:
      certification.financeModule !== "hors_plateforme",
  });
  return updatedCandidacy;
};
