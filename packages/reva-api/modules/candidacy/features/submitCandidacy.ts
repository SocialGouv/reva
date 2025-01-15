import { CandidacyStatusStep } from "@prisma/client";

import { getCandidateById } from "../../candidate/features/getCandidateById";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";
import {
  sendConfirmationCandidacySubmissionEmail,
  sendNewCandidacyEmail,
} from "../emails";
import { getCandidacyById } from "./getCandidacyById";
import { getReferentOrganismFromCandidacyId } from "./getReferentOrganismFromCandidacyId";
import { updateCandidacyStatus } from "./updateCandidacyStatus";

export const submitCandidacy = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const candidacyCreationDisabled = await isFeatureActiveForUser({
    feature: "CANDIDACY_CREATION_DISABLED",
  });
  if (candidacyCreationDisabled) {
    throw new Error("La création de candidature est désactivée");
  }

  const candidacy = await getCandidacyById({
    candidacyId,
  });
  if (!candidacy) {
    throw new Error(`Aucune candidature n'a été trouvée`);
  }

  const validateCandidacyNotAlreadySubmitted =
    candidacy.status === CandidacyStatusStep.PROJET;

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
  await sendNewCandidacyEmail({
    email: organism.emailContact ?? organism.contactAdministrativeEmail,
  });
  await sendConfirmationCandidacySubmissionEmail({
    email: candidate.email as string,
    organismName: organism.label,
    organismEmail: organism.emailContact ?? organism.contactAdministrativeEmail,
    candidacyFundedByFranceVae: candidacy.financeModule !== "hors_plateforme",
  });
  return updatedCandidacy;
};
