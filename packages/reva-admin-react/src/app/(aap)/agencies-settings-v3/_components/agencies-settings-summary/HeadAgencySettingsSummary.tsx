import { AgenciesSettingsSectionOnSite } from "@/app/(aap)/agencies-settings-v3/_components/AgenciesSettingsSectionOnSite";
import { AgencySettingsSummarySectionRemote } from "@/app/(aap)/agencies-settings-v3/_components/AgencySettingsSummarySectionRemote";
import { HeadAgencySettingsSectionAccountList } from "@/app/(aap)/agencies-settings-v3/_components/agencies-settings-section/HeadAgencySettingsSectionAccountList";
import { useHeadyAgencySettings } from "@/app/(aap)/agencies-settings-v3/_components/agencies-settings-summary/headAgencySettings.hook";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { Organism } from "@/graphql/generated/graphql";

export const HeadAgencySettingsSummary = () => {
  const { maisonMereAAP, organism, accountId } = useHeadyAgencySettings();

  if (!maisonMereAAP) {
    return null;
  }

  const isGeneralInformationCompleted = [
    "A_JOUR",
    "EN_ATTENTE_DE_VERIFICATION",
  ].includes(maisonMereAAP.statutValidationInformationsJuridiquesMaisonMereAAP);

  const hasOtherAccounts = maisonMereAAP.organisms.length > 1;

  return (
    <>
      <p className="text-xl">
        Complétez les paramètres de compte de votre structure pour recevoir vos
        premières candidatures.
      </p>
      <div className="flex flex-col gap-8 mt-4">
        <EnhancedSectionCard
          data-test="general-information"
          title="Informations générales"
          status={isGeneralInformationCompleted ? "COMPLETED" : "TO_COMPLETE"}
          isEditable
          buttonOnClickHref="/agencies-settings-v3/general-information"
          titleIconClass="fr-icon-information-fill"
        />
        <AgencySettingsSummarySectionRemote organism={organism as Organism} />
        <AgenciesSettingsSectionOnSite organisms={maisonMereAAP?.organisms} />
        <EnhancedSectionCard
          data-test="user-accounts"
          title="Comptes collaborateurs"
          isEditable
          disabled={!isGeneralInformationCompleted}
          buttonOnClickHref="/agencies-settings-v3/user-accounts/add-user-account"
          titleIconClass="fr-icon-team-fill"
          CustomBadge={<div />}
          status={hasOtherAccounts ? "COMPLETED" : "TO_COMPLETE"}
          customButtonTitle={hasOtherAccounts ? "Ajouter un compte" : "Ajouter"}
        >
          {hasOtherAccounts ? (
            <HeadAgencySettingsSectionAccountList
              headAgencyAccountId={accountId}
              organisms={maisonMereAAP.organisms}
            />
          ) : (
            <p className="ml-10 md:w-4/5">
              Vous avez besoin de collaborer à plusieurs sur la plateforme ?
              Ajoutez des comptes collaborateurs pour que vos collaborateurs
              puissent avoir accès à leurs candidatures.
            </p>
          )}
          {!isGeneralInformationCompleted && (
            <SmallNotice>
              Vous pourrez ajouter des comptes collaborateurs une fois que vous
              aurez complété les paramètres précédents.
            </SmallNotice>
          )}
        </EnhancedSectionCard>
      </div>
    </>
  );
};
