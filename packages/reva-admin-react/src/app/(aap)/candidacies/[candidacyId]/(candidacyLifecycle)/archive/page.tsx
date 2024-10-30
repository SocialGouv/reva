"use client";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { ArchiveButton } from "./_components/ArchiveButton";
import { CandidacyForArchive, useArchive } from "./_components/useArchive";
import { useCandidacyStatus } from "../../_components/candidacy.hook";

const CandidacyArchiveComponent = ({
  candidacy,
}: {
  candidacy: NonNullable<CandidacyForArchive>;
}) => {
  const { canBeArchived, candidacyCurrentActiveStatus } =
    useCandidacyStatus(candidacy);

  if (candidacyCurrentActiveStatus === "ARCHIVE") {
    return (
      <Alert
        title=""
        severity="info"
        className="my-4"
        description={`La candidature est archivée. Réorientation : ${candidacy.reorientationReason?.label ?? "Le candidat n'a pas été réorienté"}`}
      />
    );
  }

  if (!canBeArchived) {
    return (
      <Alert
        title=""
        severity="warning"
        className="my-4"
        description="La candidature ne peut pas être archivée. Son statut ne le permet pas ou vous n'avez pas les permissions nécessaires."
      />
    );
  }

  return (
    <div className="flex flex-col gap-y-2">
      <Alert
        title=""
        severity="info"
        className="my-4"
        description="La suppression permet au candidat de refaire une candidature dans le cadre de France VAE (modification du diplôme, changement d’AAP, modification de ses coordonnées, …)"
      />
      <ArchiveButton />
    </div>
  );
};

const CandidacyArchivePage = () => {
  const { candidacy } = useArchive({});

  if (!candidacy) {
    return null;
  }

  return (
    <>
      <h1 className="text-dsfrBlack-500 text-4xl mb-1">
        Suppression d'une candidature
      </h1>
      <CandidacyArchiveComponent candidacy={candidacy} />
    </>
  );
};

export default CandidacyArchivePage;
