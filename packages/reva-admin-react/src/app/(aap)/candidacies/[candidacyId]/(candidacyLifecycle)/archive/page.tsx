"use client";
import { ArchiveCandidacyForm } from "./_components/ArchiveCandidacyForm";
import { useArchive } from "./_components/useArchive";
import { ViewArchivedCandidacy } from "./_components/ViewArchivedCandidacy";

const CandidacyArchivePage = () => {
  const { candidacy } = useArchive();

  if (!candidacy) {
    return null;
  }

  return (
    <>
      <h1 data-testid="archive-candidacy-title">Archivage de la candidature</h1>
      {candidacy.status === "ARCHIVE" ? (
        <ViewArchivedCandidacy candidacy={candidacy} />
      ) : (
        <ArchiveCandidacyForm candidacy={candidacy} />
      )}
    </>
  );
};

export default CandidacyArchivePage;
