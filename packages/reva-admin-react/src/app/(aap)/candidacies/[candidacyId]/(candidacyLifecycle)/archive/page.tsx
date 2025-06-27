"use client";
import { useArchive } from "./_components/useArchive";
import { ViewArchivedCandidacy } from "./_components/ViewArchivedCandidacy";
import { ArchiveCandidacyForm } from "./_components/ArchiveCandidacyForm";

const CandidacyArchivePage = () => {
  const { candidacy } = useArchive();

  if (!candidacy) {
    return null;
  }

  return (
    <>
      <h1 data-test="archive-candidacy-title">Archivage de la candidature</h1>
      {candidacy.status === "ARCHIVE" ? (
        <ViewArchivedCandidacy candidacy={candidacy} />
      ) : (
        <ArchiveCandidacyForm candidacy={candidacy} />
      )}
    </>
  );
};

export default CandidacyArchivePage;
