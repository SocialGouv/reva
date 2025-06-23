"use client";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { UnarchiveButton } from "./_components/UnarchiveButton";
import {
  CandidacyForUnarchive,
  useUnarchive,
} from "./_components/useUnarchive";
import { useCandidacyStatus } from "../../_components/candidacy.hook";
import Button from "@codegouvfr/react-dsfr/Button";

const CandidacyUnarchiveComponent = ({
  candidacy,
}: {
  candidacy: NonNullable<CandidacyForUnarchive>;
}) => {
  const { canBeRestored } = useCandidacyStatus(candidacy);

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
    <div className="flex flex-col mt-6">
      <div className="flex justify-between">
        <Button
          priority="tertiary"
          linkProps={{
            href: `/candidacies/${candidacy.id}/summary`,
          }}
        >
          Retour
        </Button>
        <UnarchiveButton />
      </div>
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
