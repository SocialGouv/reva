import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { useAgenciesSettings } from "@/app/(aap)/agencies-settings-v3/_components/agenciesSettings.hook";
import { AgencySettingsSummarySectionRemote } from "@/app/(aap)/agencies-settings-v3/_components/AgencySettingsSummarySectionRemote";

export const AgencySettingsSummary = () => {
  const { organism } = useAgenciesSettings();

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
        <p className="md:w-4/5">
          Ici les informations de connexion du collaborateur actuellement
          connecté
        </p>
      </EnhancedSectionCard>
    </>
  );
};
