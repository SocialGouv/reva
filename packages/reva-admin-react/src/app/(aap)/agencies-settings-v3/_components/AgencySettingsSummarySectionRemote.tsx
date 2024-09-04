import Badge from "@codegouvfr/react-dsfr/Badge";
import { getRemoteZoneLabel } from "@/app/(aap)/agencies-settings-v3/_components/getRemoteZoneLabel";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { RemoteZone } from "@/graphql/generated/graphql";

export const AgencySettingsSummarySectionRemote = ({
  organism,
}: {
  organism?: {
    id: string;
    isRemote: boolean;
    isVisibleInCandidateSearchResults: boolean;
    remoteZones: RemoteZone[];
  };
}) => {
  if (!organism || !organism.isRemote) return null;

  return (
    <EnhancedSectionCard
      data-test="remote-agency"
      title="Accompagnement à distance"
      buttonOnClickHref={`/agencies-settings-v3/organisms/${organism.id}/remote`}
      isEditable={true}
      titleIconClass="fr-icon-headphone-fill"
    >
      <div className="pl-10 flex flex-col gap-4">
        <Badge
          small
          severity={
            organism.isVisibleInCandidateSearchResults ? "success" : "error"
          }
        >
          {organism.isVisibleInCandidateSearchResults ? "Visible" : "Invisible"}
        </Badge>
        <ul className="list-none pl-0 flex flex-col gap-2">
          {organism.remoteZones.map((r) => (
            <li key={r}>{getRemoteZoneLabel(r)}</li>
          ))}
        </ul>
      </div>
    </EnhancedSectionCard>
  );
};
