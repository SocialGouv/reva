import { CandidacyStatusStep } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import { isFeatureActiveForUser } from "../../feature-flipping/feature-flipping.features";
import {
  sendConfirmationCandidacySubmissionEmail,
  sendNewCandidacyEmail,
} from "../mails";
import { getCandidacyById } from "./getCandidacyById";
import { getCandidateById } from "./getCandidateById";
import { getReferentOrganismFromCandidacyId } from "./getReferentOrganismFromCandidacyId";
import { updateCandidacyStatus } from "./updateCandidacyStatus";
import { existsCandidacyWithActiveStatus } from "./existsCandidacyWithActiveStatus";

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

  const financementHorsPlateforme = await isFeatureActiveForUser({
    feature: "NOUVELLES_CANDIDATURES_EN_FINANCEMENT_HORS_PLATEFORME",
  });

  await prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: {
      financeModule: financementHorsPlateforme ? "hors_plateforme" : "unifvae",
    },
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
    candidacyFundedByFranceVae: !financementHorsPlateforme,
  });
  return updatedCandidacy;
};
