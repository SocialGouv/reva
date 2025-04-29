import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import Badge from "@codegouvfr/react-dsfr/Badge";

export default function GeneralInformationCard({
  hrefPrefix,
  certificationAuthority,
}: {
  hrefPrefix: string;
  certificationAuthority: {
    id: string;
    label: string;
    contactFullName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
  };
}) {
  const isComplete =
    certificationAuthority.contactFullName &&
    certificationAuthority.contactEmail;
  return (
    <EnhancedSectionCard
      title="Informations générales"
      titleIconClass="fr-icon-information-fill"
      isEditable
      status={isComplete ? "COMPLETED" : "TO_COMPLETE"}
      buttonOnClickHref={`${hrefPrefix}/informations-generales`}
      // buttonOnClickHref={`/certification-authority-structures/${certificationAuthority.certificationAuthorityStructures[0].id}/certificateurs-administrateurs/${certificationAuthority.id}/informations-generales`}
    >
      <div className="pl-10">
        <p className="text-xl font-bold mb-2">{certificationAuthority.label}</p>
        {isComplete ? (
          <>
            <div className="flex gap-x-2">
              <p>Contact référent :</p>
              <div>
                <p className="my-0">{certificationAuthority.contactFullName}</p>
                <p className="my-0">{certificationAuthority.contactEmail}</p>
                <p className="my-0">{certificationAuthority.contactPhone}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-y-6">
            <Badge severity="new" small>
              Aucun contact référent
            </Badge>
            <SmallNotice className="-ml-10">
              Ajoutez un contact référent pour améliorer le suivi et la
              communication avec les AAP et les candidats
            </SmallNotice>
          </div>
        )}
      </div>
    </EnhancedSectionCard>
  );
}
