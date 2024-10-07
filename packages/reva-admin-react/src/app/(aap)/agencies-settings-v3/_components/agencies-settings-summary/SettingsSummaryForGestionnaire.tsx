import { AgenciesSettingsSectionOnSite } from "@/app/(aap)/agencies-settings-v3/_components/AgenciesSettingsSectionOnSite";
import { AgencySettingsSummarySectionRemote } from "@/app/(aap)/agencies-settings-v3/_components/AgencySettingsSummarySectionRemote";
import { HeadAgencySettingsSectionAccountList } from "@/app/(aap)/agencies-settings-v3/_components/agencies-settings-section/HeadAgencySettingsSectionAccountList";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { MaisonMereAap, Organism } from "@/graphql/generated/graphql";

const getRemoteOrganism = ({
  organism,
  maisonMereAAP,
}: {
  organism: Organism;
  maisonMereAAP: MaisonMereAap;
}) => {
  // Utiliser l'agence actuelle si elle est configurée pour l'acompagnement à distance
  if (organism?.isRemote) {
    return organism;
  }

  // Sinon, vérifier parmi toutes les agences s'il y en a une configurée pour l'acompagnement à distance
  const maisonMereAAPRemoteOrganism = maisonMereAAP?.organisms?.find(
    (o) => o.isRemote,
  );
  if (maisonMereAAPRemoteOrganism) {
    return maisonMereAAPRemoteOrganism;
  }

  // Si aucune agence n'est configurée pour l'acompagnement à distance, utiliser l'agence administratrice
  return maisonMereAAP.organisms.find((o) => o.isHeadAgency);
};

export const SettingsSummaryForGestionnaire = ({
  maisonMereAAP,
  organism,
  accountId,
}: {
  maisonMereAAP: MaisonMereAap;
  organism: Organism;
  accountId: string;
}) => {
  if (!maisonMereAAP) {
    return null;
  }
  const isGeneralInformationCompleted = [
    "A_JOUR",
    "EN_ATTENTE_DE_VERIFICATION",
  ].includes(maisonMereAAP.statutValidationInformationsJuridiquesMaisonMereAAP);

  const remoteOrganism = getRemoteOrganism({
    organism: organism as Organism,
    maisonMereAAP: maisonMereAAP as MaisonMereAap,
  });

  const hasOtherAccounts = maisonMereAAP.organisms.length > 1;

  return (
    <div className="flex flex-col gap-8 mt-4 w-full">
      <EnhancedSectionCard
        data-test="general-information"
        title="Informations générales"
        status={isGeneralInformationCompleted ? "COMPLETED" : "TO_COMPLETE"}
        isEditable
        buttonOnClickHref={`/agencies-settings-v3/${maisonMereAAP.id}/general-information`}
        titleIconClass="fr-icon-information-fill"
      />
      <AgencySettingsSummarySectionRemote
        organism={remoteOrganism}
        maisonMereAAPId={maisonMereAAP.id}
      />
      <AgenciesSettingsSectionOnSite
        organisms={maisonMereAAP?.organisms.filter((o) => !o.isHeadAgency)} //on site organisms are everty organism that are not flagged as head agency
        maisonMereAAPId={maisonMereAAP.id}
      />
      <EnhancedSectionCard
        data-test="user-accounts"
        title="Comptes collaborateurs"
        isEditable
        disabled={!isGeneralInformationCompleted}
        buttonOnClickHref={`/agencies-settings-v3/${maisonMereAAP.id}/user-accounts/add-user-account`}
        titleIconClass="fr-icon-team-fill"
        CustomBadge={<div />}
        status={hasOtherAccounts ? "COMPLETED" : "TO_COMPLETE"}
        customButtonTitle={hasOtherAccounts ? "Créer un compte" : "Ajouter"}
      >
        {hasOtherAccounts ? (
          <HeadAgencySettingsSectionAccountList
            headAgencyAccountId={accountId}
            organisms={maisonMereAAP.organisms}
            maisonMereAAPId={maisonMereAAP.id}
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
  );
};
