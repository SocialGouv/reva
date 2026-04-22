import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { format } from "date-fns";

import { CandidacyForArchive, getArchivingReasonLabel } from "./useArchive";

export const ViewArchivedCandidacy = ({
  candidacy,
}: {
  candidacy: NonNullable<CandidacyForArchive>;
}) => {
  const archivedAt = candidacy.candidacyStatuses.find(
    (s) => s.status === "ARCHIVE",
  )?.createdAt;

  return (
    <div className="flex flex-col gap-y-2">
      <p className="text-xl leading-relaxed">
        Vous avez archivé cette candidature.
        <br />
        Retrouvez les informations liées à cette archivage ici.
      </p>
      <div className="flex justify-between">
        <span>Date d’archivage</span>
        <span>{archivedAt ? format(archivedAt, "dd/MM/yyyy") : ""}</span>
      </div>
      <hr className="mt-2 pb-4" />
      <div className="flex justify-between">
        <span>Raison</span>
        <span>{getArchivingReasonLabel(candidacy.archivingReason)}</span>
      </div>
      <hr className="mt-2 pb-4" />
      <Alert
        title=""
        severity="info"
        className="mt-4"
        description="Vous pensez avoir fait une erreur ? Contactez le support afin de résoudre le problème."
      />
    </div>
  );
};
