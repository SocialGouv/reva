import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";

import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { AAPSettingsSummarySectionRemote } from "@/components/settings/aap-settings-summary-section-remote/AAPSettingsSummarySectionRemote";

import { useCollaborateurSettings } from "./settingsForCollaborateur.hook";

export const SettingsSummaryForCollaborateur = () => {
  const { organism, account, maisonMereAAPId } = useCollaborateurSettings();

  if (!account || !organism) return null;

  return (
    <>
      <p className="text-xl">
        Retrouvez ici les informations liées à vos modalités d’accompagnement et
        à votre connexion.
      </p>
      <div className="flex flex-col gap-8 mt-4">
        {organism?.modaliteAccompagnement === "A_DISTANCE" && (
          <AAPSettingsSummarySectionRemote
            organism={organism}
            detailsPageUrl={`/agencies-settings-v3/${maisonMereAAPId}/organisms/${organism?.id}/remote`}
          />
        )}
        {organism?.modaliteAccompagnement === "LIEU_ACCUEIL" && (
          <EnhancedSectionCard
            data-testid="on-site-organism"
            title="Accompagnement en présentiel"
            buttonOnClickHref="/agencies-settings-v3/on-site"
            titleIconClass="fr-icon-home-4-fill"
          >
            <div className="flex items-center justify-between pt-4 pb-3 border-neutral-300 border-t last:border-b">
              <span className="font-bold">
                {organism.label}{" "}
                {`( ${organism.nomPublic || "Nom commercial non renseignés"} )`}
                <Badge
                  small
                  className="ml-2"
                  severity={
                    organism.isVisibleInCandidateSearchResults
                      ? "success"
                      : "error"
                  }
                >
                  {organism.isVisibleInCandidateSearchResults
                    ? "Visible"
                    : "Invisible"}
                </Badge>
              </span>
              <span>
                <Button
                  priority="tertiary no outline"
                  size="small"
                  linkProps={{
                    href: `/agencies-settings-v3/${maisonMereAAPId}/organisms/${organism.id}/on-site`,
                  }}
                >
                  Modifier
                </Button>
              </span>
            </div>
          </EnhancedSectionCard>
        )}
        <EnhancedSectionCard
          data-testid="user-account"
          title="Informations de connexion"
          isEditable={false}
          titleIconClass="fr-icon-account-fill"
          CustomBadge={<div />}
          status="COMPLETED"
        >
          <div className="flex gap-x-6 items-center justify-between pt-4 pb-3 border-neutral-300 border-t last:border-b">
            <div className="flex gap-x-6">
              {organism.modaliteAccompagnement == "A_DISTANCE" && (
                <i
                  data-testid="remote-badge"
                  className="fr-icon-headphone-fill fr-icon--sm"
                ></i>
              )}
              {organism.modaliteAccompagnement === "LIEU_ACCUEIL" && (
                <i
                  data-testid="on-site-badge"
                  className="fr-icon-home-4-fill fr-icon--sm"
                ></i>
              )}
              <span>
                <span className="font-bold">
                  {account?.firstname} {account?.lastname}
                </span>
                {" - "} {account?.email}
              </span>
            </div>
            <span>
              <Button
                priority="tertiary no outline"
                size="small"
                linkProps={{
                  href: `/agencies-settings-v3/${maisonMereAAPId}/user-accounts/${account?.id}`,
                }}
              >
                Visualiser
              </Button>
            </span>
          </div>
        </EnhancedSectionCard>
      </div>
    </>
  );
};
