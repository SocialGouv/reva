import { Highlight } from "@codegouvfr/react-dsfr/Highlight";

import { GestionnaireMaisonMereAAPSettingsSectionAccountList } from "@/app/(aap)/agencies-settings-v3/_components/agencies-settings-section/GestionnaireMaisonMereAAPSettingsSectionAccountList";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { SmallNotice } from "@/components/small-notice/SmallNotice";

import { Account, MaisonMereAap, Organism } from "@/graphql/generated/graphql";

import { AAPSettingsSectionOnSite } from "../AAPSettingsSectionOnSite";
import { AAPSettingsSummarySectionRemote } from "../AAPSettingsSummarySectionRemote";

const getRemoteOrganism = ({
  organism,
  maisonMereAAP,
}: {
  organism: Organism;
  maisonMereAAP: MaisonMereAap;
}) => {
  // Utiliser l'organisme actuel si il est configuré pour l'acompagnement à distance
  if (organism?.modaliteAccompagnement === "A_DISTANCE") {
    return organism;
  }

  // Sinon, vérifier parmi toutes les organismes s'il y en a un configuré pour l'acompagnement à distance
  const maisonMereAAPRemoteOrganism = maisonMereAAP?.organisms?.find(
    (o) => o.modaliteAccompagnement === "A_DISTANCE",
  );
  if (maisonMereAAPRemoteOrganism) {
    return maisonMereAAPRemoteOrganism;
  }
};

export const SettingsSummaryForGestionnaire = ({
  maisonMereAAP,
  organism,
  gestionnaireAccountId,
  isAdmin,
}: {
  maisonMereAAP: MaisonMereAap;
  organism: Organism;
  gestionnaireAccountId: string;
  isAdmin: boolean;
}) => {
  if (!maisonMereAAP) {
    return null;
  }
  const isGeneralInformationCompleted = [
    "A_JOUR",
    "EN_ATTENTE_DE_VERIFICATION",
  ].includes(maisonMereAAP.statutValidationInformationsJuridiquesMaisonMereAAP);

  const isFinancingMethodsCompleted = maisonMereAAP.isMCFCompatible !== null;

  const remoteOrganism = getRemoteOrganism({
    organism: organism as Organism,
    maisonMereAAP: maisonMereAAP as MaisonMereAap,
  });

  let otherAccounts = maisonMereAAP.organisms.reduce((acc, organism) => {
    const accounts = organism.accounts.filter(
      (account) => account.id != gestionnaireAccountId,
    );
    return [...acc, ...accounts];
  }, [] as Account[]);

  otherAccounts = isAdmin
    ? otherAccounts
    : otherAccounts.filter((account) => !account.disabledAt);
  const hasOtherAccounts = otherAccounts.length > 0;

  return (
    <div className="flex flex-col gap-8 mt-4 w-full">
      <EnhancedSectionCard
        data-testid="general-information"
        title="Informations générales"
        status={isGeneralInformationCompleted ? "COMPLETED" : "TO_COMPLETE"}
        isEditable
        buttonOnClickHref={`/agencies-settings-v3/${maisonMereAAP.id}/general-information`}
        titleIconClass="fr-icon-information-fill"
      />
      <EnhancedSectionCard
        data-testid="financing-methods"
        title="Modalités de financement"
        status={isFinancingMethodsCompleted ? "COMPLETED" : "TO_COMPLETE"}
        isEditable
        buttonOnClickHref={`/agencies-settings-v3/${maisonMereAAP.id}/financing-methods`}
        titleIconClass="fr-icon-coin-fill"
      >
        {!isFinancingMethodsCompleted && (
          <p data-testid="no-financing-method-text">
            Vous êtes référencé sur la plateforme Mon Compte Formation ?
            Faites-le faire savoir aux candidats afin qu’ils puissent financer
            l’accompagnement via ce dispositif.
          </p>
        )}
        {isFinancingMethodsCompleted && (
          <Highlight
            className="[&_p]:mb-0"
            data-testid="financing-methods-text"
          >
            {maisonMereAAP.isMCFCompatible
              ? "Référencé Mon Compte Formation"
              : "Non-référencé Mon Compte Formation"}
          </Highlight>
        )}
      </EnhancedSectionCard>
      <AAPSettingsSummarySectionRemote
        organism={remoteOrganism}
        maisonMereAAPId={maisonMereAAP.id}
      />
      <AAPSettingsSectionOnSite
        organisms={maisonMereAAP?.organisms.filter(
          (o) => o.modaliteAccompagnement === "LIEU_ACCUEIL",
        )}
        maisonMereAAPId={maisonMereAAP.id}
        isEditable={!isAdmin}
      />
      <EnhancedSectionCard
        data-testid="user-accounts"
        title="Comptes collaborateurs"
        isEditable={!isAdmin}
        disabled={!isGeneralInformationCompleted}
        buttonOnClickHref={`/agencies-settings-v3/${maisonMereAAP.id}/user-accounts/add-user-account`}
        titleIconClass="fr-icon-team-fill"
        CustomBadge={<div />}
        status={hasOtherAccounts ? "COMPLETED" : "TO_COMPLETE"}
        customButtonTitle={"Créer un compte"}
      >
        {hasOtherAccounts ? (
          <GestionnaireMaisonMereAAPSettingsSectionAccountList
            gestionnaireAccountId={gestionnaireAccountId}
            organisms={maisonMereAAP.organisms}
            maisonMereAAPId={maisonMereAAP.id}
            isAdmin={isAdmin}
          />
        ) : (
          <p className="ml-10 md:w-4/5">
            Vous avez besoin de collaborer à plusieurs sur la plateforme ? Créez
            des comptes collaborateurs pour que vos collaborateurs puissent
            avoir accès à leurs candidatures.
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
