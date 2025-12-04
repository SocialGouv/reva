import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";

import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";

export const CollaborateurSettingsSummarySectionOnsite = ({
  organisms,
}: {
  organisms: {
    id: string;
    isVisibleInCandidateSearchResults: boolean;
    nomPublic?: string | null;
    modaliteAccompagnementRenseigneeEtValide: boolean;
    detailsPageUrl: string;
  }[];
}) => {
  if (!organisms.length) return null;
  return (
    <EnhancedSectionCard
      data-testid="onsite-organisms"
      title="Accompagnement en présentiel"
      isEditable={false}
      titleIconClass="fr-icon-home-4-fill"
    >
      <div className="pl-10 flex flex-col gap-4">
        <ul className="list-none pl-0 flex flex-col gap-2">
          <hr className="pb-1" />
          {organisms.map((o) => (
            <li key={o.id}>
              <div className="flex gap-4 items-center">
                <span className="font-bold">{o.nomPublic}</span>
                {o.isVisibleInCandidateSearchResults ? (
                  <Badge data-testid="visible-badge" severity="success" small>
                    Visible
                  </Badge>
                ) : (
                  <Badge data-testid="invisible-badge" severity="warning" small>
                    Invisible
                  </Badge>
                )}
                <Button
                  className="ml-auto"
                  priority="tertiary no outline"
                  size="small"
                  linkProps={{
                    href: o.detailsPageUrl,
                  }}
                >
                  Modifier
                </Button>
              </div>
              <hr className="mt-2 pb-1" />
            </li>
          ))}
        </ul>
      </div>
    </EnhancedSectionCard>
  );
};
