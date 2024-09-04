import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { AgenciesSettingsSectionOnSite } from "@/app/(aap)/agencies-settings-v3/_components/AgenciesSettingsSectionOnSite";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { useAgenciesSettings } from "@/app/(aap)/agencies-settings-v3/_components/agenciesSettings.hook";
import { AgencySettingsSummarySectionRemote } from "@/app/(aap)/agencies-settings-v3/_components/AgencySettingsSummarySectionRemote";

export const HeadAgencySettingsSummary = () => {
  const { maisonMereAAP, organism } = useAgenciesSettings();

  const isGeneralInformationCompleted =
    !!maisonMereAAP &&
    ["A_JOUR", "EN_ATTENTE_DE_VERIFICATION"].includes(
      maisonMereAAP.statutValidationInformationsJuridiquesMaisonMereAAP,
    );

  const remoteOrganism = organism?.isRemote
    ? organism
    : maisonMereAAP?.organisms.find((o) => o.isRemote);

  return (
    <>
      <EnhancedSectionCard
        data-test="general-information"
        title="Informations générales"
        status={isGeneralInformationCompleted ? "COMPLETED" : "TO_COMPLETE"}
        isEditable
        buttonOnClickHref="/agencies-settings-v3/general-information"
        titleIconClass="fr-icon-information-fill"
      />
      <AgencySettingsSummarySectionRemote organism={remoteOrganism} />
      <AgenciesSettingsSectionOnSite organisms={maisonMereAAP?.organisms} />
      <EnhancedSectionCard
        data-test="user-accounts"
        title="Comptes collaborateurs"
        isEditable={isGeneralInformationCompleted}
        disabled={!isGeneralInformationCompleted}
        buttonOnClickHref="/agencies-settings-v3/user-accounts/add-user-account"
        titleIconClass="fr-icon-team-fill"
        CustomBadge={<div />}
        status="TO_COMPLETE"
        customButtonTitle="Ajouter"
      >
        <p className="md:w-4/5">
          Vous avez besoin de collaborer à plusieurs sur la plateforme ? Ajoutez
          des comptes collaborateurs pour que vos collaborateurs puissent avoir
          accès à leurs candidatures.
        </p>
        {!isGeneralInformationCompleted && (
          <SmallNotice>
            Vous pourrez ajouter des comptes collaborateurs une fois que vous
            aurez complété les paramètres précédents.
          </SmallNotice>
        )}
      </EnhancedSectionCard>
    </>
  );
};
