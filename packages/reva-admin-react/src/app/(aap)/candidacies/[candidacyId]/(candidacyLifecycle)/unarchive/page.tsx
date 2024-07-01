"use client";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { UnarchiveButton } from "./_components/UnarchiveButton";
import {
  CandidacyForUnarchive,
  useUnarchive,
} from "./_components/useUnarchive";
import { useCandidacyStatus } from "../../_components/candidacy.hook";

const CandidacyUnarchiveComponent = ({
  candidacy,
}: {
  candidacy: NonNullable<CandidacyForUnarchive>;
}) => {
  const { canBeRestored } =
    useCandidacyStatus(candidacy);

  if (!canBeRestored) {
    return (
      <Alert
        title=""
        severity="warning"
        className="my-4"
        description="Impossible de restaurer la candidature. Son statut ne le permet pas ou vous n'avez pas les permissions nécessaires."
      />
    );
  }

  return (
    <div className="flex flex-col items-end mt-6">
      <UnarchiveButton />
    </div>
  );
};

const CandidacyUnarchivePage = () => {
  const { candidacy } = useUnarchive({});

  if (!candidacy) {
    return null;
  }

  return (
    <>
      <h1 className="text-dsfrBlack-500 text-4xl mb-1">
        Restaurer une candidature supprimée
      </h1>
      <CandidacyUnarchiveComponent candidacy={candidacy} />
    </>
  );
};

export default CandidacyUnarchivePage;
