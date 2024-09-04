import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { useAgencySettings } from "@/app/(aap)/agencies-settings-v3/_components/agencies-settings-summary/agencySettings.hook";
import { AgencySettingsSummarySectionRemote } from "@/app/(aap)/agencies-settings-v3/_components/AgencySettingsSummarySectionRemote";
import Button from "@codegouvfr/react-dsfr/Button";

export const AgencySettingsSummary = () => {
  const { organism, account } = useAgencySettings();

  return (
    <>
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
          <p className="md:w-4/5">
            Ici le lieu d'accueil et son statut de visibilité
          </p>
        </EnhancedSectionCard>
      )}
      <EnhancedSectionCard
        data-test="user-account"
        title="Informations de connexion"
        isEditable={false}
        titleIconClass="fr-icon-team-fill"
        CustomBadge={<div />}
        status="COMPLETED"
      >
        <div className="flex items-center justify-between pt-4 pb-3 border-neutral-300 border-t last:border-b">
          <span>
            <i className="fr-icon--sm fr-icon-home-4-fill mr-4" />
            <span className="font-bold">
              {account?.firstname} {account?.lastname}
            </span>{" "}
            - {account?.email}
          </span>{" "}
          <span>
            <Button
              priority="tertiary no outline"
              size="small"
              linkProps={{
                href: `/agencies-settings-v3/user-accounts/${account?.id}`,
              }}
            >
              Modifier
            </Button>
          </span>
        </div>
      </EnhancedSectionCard>
    </>
  );
};
