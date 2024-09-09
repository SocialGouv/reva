import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { useAgencySettings } from "@/app/(aap)/agencies-settings-v3/_components/agencies-settings-summary/agencySettings.hook";
import { AgencySettingsSummarySectionRemote } from "@/app/(aap)/agencies-settings-v3/_components/AgencySettingsSummarySectionRemote";
import Button from "@codegouvfr/react-dsfr/Button";
import Badge from "@codegouvfr/react-dsfr/Badge";

export const AgencySettingsSummary = () => {
  const { organism, account } = useAgencySettings();

  if (!account || !organism) return null;

  return (
    <>
      <p className="text-xl">
        Retrouvez ici les informations liées à vos modalités d’accompagnement et
        à votre connexion.
      </p>
      <div className="flex flex-col gap-8 mt-4">
        {organism?.isRemote && (
          <AgencySettingsSummarySectionRemote organism={organism} />
        )}
        {organism?.isOnSite && (
          <EnhancedSectionCard
            data-test="on-site-agency"
            title="Accompagnement en présentiel"
            isEditable={false}
            buttonOnClickHref="/agencies-settings-v3/on-site"
            titleIconClass="fr-icon-home-4-fill"
          >
            <div className="flex items-center justify-between pt-4 pb-3 border-neutral-300 border-t last:border-b">
              <span className="font-bold">
                {organism.label}{" "}
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
                    href: `/agencies-settings-v3/organisms/${organism.id}/on-site`,
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
              {organism.isRemote && (
                <i
                  data-test="remote-badge"
                  className="fr-icon-headphone-fill fr-icon--sm"
                ></i>
              )}
              {organism.isOnSite && (
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
                  href: `/agencies-settings-v3/user-accounts/${account?.id}`,
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
