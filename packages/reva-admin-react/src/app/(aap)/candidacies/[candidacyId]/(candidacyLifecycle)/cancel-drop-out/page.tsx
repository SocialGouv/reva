"use client";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { CancelDropoutButton } from "./_components/CancelDropoutButton";
import {
  CandidacyForCancelDropout,
  useCancelDropout,
} from "./_components/useCancelDropout";
import { useCandidacyStatus } from "../../_components/candidacy.hook";

const CandidacyArchiveComponent = ({
  candidacy,
}: {
  candidacy: NonNullable<CandidacyForCancelDropout>;
}) => {
  const { canCancelDropout, isCandidacyDroppedOut } =
    useCandidacyStatus(candidacy);

  if (!isCandidacyDroppedOut) {
    return (
      <Alert
        title=""
        severity="info"
        className="my-4"
        description="La candidature n'est pas abandonnée"
      />
    );
  }

  if (!canCancelDropout) {
    return (
      <Alert
        title=""
        severity="warning"
        className="my-4"
        description="Impossible d'annuler l'abandon de la candidature. Son statut ne le permet pas ou vous n'avez pas les permissions nécessaires."
      />
    );
  }

  return (
    <div className="flex flex-col items-end mt-6">
      <CancelDropoutButton />
    </div>
  );
};

const CandidacyArchivePage = () => {
  const { candidacy, candidacyId } = useCancelDropout({});

  if (!candidacy) {
    return null;
  }

  return (
    <>
      <h1 className="text-dsfrBlack-500 text-4xl mb-1">Annuler l'abandon</h1>
      <CandidacyArchiveComponent candidacy={candidacy} />
    </>
  );
};

export default CandidacyArchivePage;
