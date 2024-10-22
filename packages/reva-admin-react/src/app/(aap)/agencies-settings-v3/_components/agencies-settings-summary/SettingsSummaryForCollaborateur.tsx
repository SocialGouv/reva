import { useAgencySettings } from "@/app/(aap)/agencies-settings-v3/_components/agencies-settings-summary/settingsForCollaborateur.hook";
import { AgencySettingsSummarySectionRemote } from "@/app/(aap)/agencies-settings-v3/_components/AgencySettingsSummarySectionRemote";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";

export const SettingsSummaryForCollaborateur = () => {
  const { organism, account, maisonMereAAPId } = useAgencySettings();

  if (!account || !organism) return null;

  console.log(organism);

  return (
    <>
      <p className="text-xl">
        Retrouvez ici les informations liées à vos modalités d’accompagnement et
        à votre connexion.
      </p>
      <div className="flex flex-col gap-8 mt-4">
        {organism?.isHeadAgency && (
          <AgencySettingsSummarySectionRemote
            organism={organism}
            maisonMereAAPId={maisonMereAAPId}
          />
        )}
        {!organism?.isHeadAgency && (
          <EnhancedSectionCard
            data-test="on-site-agency"
            title="Accompagnement en présentiel"
            buttonOnClickHref="/agencies-settings-v3/on-site"
            titleIconClass="fr-icon-home-4-fill"
          >
            <div className="flex items-center justify-between pt-4 pb-3 border-neutral-300 border-t last:border-b">
              <span className="font-bold">
                {organism.label}{" "}
                {`( ${
                  organism.informationsCommerciales?.nom ||
                  "Nom commercial non renseignés"
                } )`}
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
          data-test="user-account"
          title="Informations de connexion"
          isEditable={false}
          titleIconClass="fr-icon-account-fill"
          CustomBadge={<div />}
          status="COMPLETED"
        >
          <div className="flex gap-x-6 items-center justify-between pt-4 pb-3 border-neutral-300 border-t last:border-b">
            <div className="flex gap-x-6">
              {organism.isHeadAgency && (
                <i
                  data-test="remote-badge"
                  className="fr-icon-headphone-fill fr-icon--sm"
                ></i>
              )}
              {!organism.isHeadAgency && (
                <i
                  data-test="on-site-badge"
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
