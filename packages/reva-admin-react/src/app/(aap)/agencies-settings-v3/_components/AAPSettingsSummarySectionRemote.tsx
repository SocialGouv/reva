import Badge from "@codegouvfr/react-dsfr/Badge";

import { getRemoteZoneLabel } from "@/app/(aap)/agencies-settings-v3/_components/getRemoteZoneLabel";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";

import { RemoteZone } from "@/graphql/generated/graphql";

export const AAPSettingsSummarySectionRemote = ({
  organism,
  maisonMereAAPId,
}: {
  organism?: {
    id: string;
    isVisibleInCandidateSearchResults: boolean;
    remoteZones: RemoteZone[];
    nomPublic?: string | null;
    modaliteAccompagnementRenseigneeEtValide: boolean;
  };
  maisonMereAAPId: string;
}) => {
  if (!organism) return null;

  const informationComplete = organism.modaliteAccompagnementRenseigneeEtValide;

  return (
    <EnhancedSectionCard
      data-testid="remote-organism"
      title="Accompagnement à distance"
      buttonOnClickHref={`/agencies-settings-v3/${maisonMereAAPId}/organisms/${organism.id}/remote`}
      isEditable={true}
      CustomBadge={
        organism.isVisibleInCandidateSearchResults ? (
          <Badge data-testid="visible-badge" severity="success">
            Visible
          </Badge>
        ) : (
          <Badge data-testid="invisible-badge" severity="error">
            Invisible
          </Badge>
        )
      }
      titleIconClass="fr-icon-headphone-fill"
    >
      {!informationComplete && (
        <p className="md:w-4/5">
          Ce choix est optionnel. Vous pouvez très bien paramétrer votre compte
          sans sélectionner cette modalité d’accompagnement.
        </p>
      )}
      <div className="pl-10 flex flex-col gap-4">
        <ul className="list-none pl-0 flex flex-col gap-2">
          <div className="font-bold mb-2">{organism.nomPublic}</div>
          {organism.remoteZones.map((r) => (
            <li key={r}>{getRemoteZoneLabel(r)}</li>
          ))}
        </ul>
      </div>
    </EnhancedSectionCard>
  );
};
