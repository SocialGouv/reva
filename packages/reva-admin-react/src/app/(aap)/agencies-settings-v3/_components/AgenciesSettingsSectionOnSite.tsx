import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { Organism } from "@/graphql/generated/graphql";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Badge from "@codegouvfr/react-dsfr/Badge";

const VisibilityBadge = ({ isVisible }: { isVisible: boolean }) => {
  return (
    <Badge severity={isVisible ? "success" : "error"}>
      {isVisible ? "Visible" : "Invisible"}
    </Badge>
  );
};

export const AgenciesSettingsSectionOnSite = ({
  isGestionnaireMaisonMereAAP,
  organisms,
}: {
  isGestionnaireMaisonMereAAP?: boolean;
  organisms: Organism[];
}) => {
  if (!isGestionnaireMaisonMereAAP) return null;
  const isOnSiteAgencyComplete = !!organisms.length;

  return (
    <EnhancedSectionCard
      title="Accompagnement en présentiel"
      buttonOnClickHref="/agencies-settings-v3/organisms/add-agency"
      titleIconClass="fr-icon-home-4-fill"
      isEditable
      customButtonTitle={
        isOnSiteAgencyComplete ? "Ajouter un lieu d'accueil" : "Ajouter"
      }
      status={isOnSiteAgencyComplete ? "COMPLETED" : "TO_COMPLETE"}
      CustomBadge={<div />}
    >
      {!isOnSiteAgencyComplete && (
        <p className="md:w-4/5">
          Vous avez des collaborateurs qui font des accompagnements en
          présentiel ? Ajoutez les lieux d'accueil dans lesquels se rendront les
          candidats.
        </p>
      )}
      <div className="fr-accordions-group sm:pl-10">
        {organisms.map((o) => (
          <Accordion
            key={o.id}
            label={
              <div className="flex items-center gap-2">
                <span className="min-w-48">
                  {o.informationsCommerciales?.nom || o.label}
                </span>
                <VisibilityBadge
                  isVisible={o.isVisibleInCandidateSearchResults}
                />
              </div>
            }
          >
            <p>
              {o.isVisibleInCandidateSearchResults ? "Visible" : "Invisible"}
            </p>
          </Accordion>
        ))}
      </div>
    </EnhancedSectionCard>
  );
};
