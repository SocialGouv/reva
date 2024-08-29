"use client";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { useAgenciesSettings } from "./_components/agenciesSettings.hook";

const AgenciesSettingsPage = () => {
  const { isFeatureActive } = useFeatureflipping();
  const isSettingsEnabled = isFeatureActive("AAP_SETTINGS_V3");
  const { maisonMereAAP, organism } = useAgenciesSettings();
  if (!isSettingsEnabled) {
    return null;
  }
  const isGeneralInformationCompleted =
    maisonMereAAP?.statutValidationInformationsJuridiquesMaisonMereAAP ===
    "A_JOUR";
  const isRemoteCompleted = !!organism?.isRemote;
  const isOnSiteCompleted = !!organism?.isOnSite;
  const isCollaboratorsEditable =
    isGeneralInformationCompleted && (isRemoteCompleted || isOnSiteCompleted);
  return (
    <div className="flex flex-col w-full">
      <h1>Paramètres</h1>
      <p>
        Retrouvez ici les informations renseignées lors de l'inscription. Vous
        pouvez signaler un changement au support si ces informations ne sont
        plus à jour.
      </p>
      <div className="flex flex-col gap-8 mt-6">
        <EnhancedSectionCard
          title="Informations générales"
          status={isGeneralInformationCompleted ? "COMPLETED" : "TO_COMPLETE"}
          isEditable
          buttonOnClickHref="/agencies-settings/general-information"
          titleIconClass="fr-icon-information-fill"
        />
        <EnhancedSectionCard
          title="Accompagnement à distance"
          status={isRemoteCompleted ? "COMPLETED" : "TO_COMPLETE"}
          isEditable={!isOnSiteCompleted}
          buttonOnClickHref="/agencies-settings/remote"
          titleIconClass="fr-icon-headphone-fill"
          disabled={isOnSiteCompleted}
        />
        <EnhancedSectionCard
          title="Accompagnement en présentiel"
          status={isOnSiteCompleted ? "COMPLETED" : "TO_COMPLETE"}
          isEditable={!isRemoteCompleted}
          buttonOnClickHref="/agencies-settings/on-site"
          titleIconClass="fr-icon-home-4-fill"
          disabled={isRemoteCompleted}
        >
          <p className="md:w-4/5">
            Vous avez des collaborateurs qui font des accompagnements en
            présentiel ? Ajoutez les lieux d'accueil dans lesquels se rendront
            les candidats.
          </p>
        </EnhancedSectionCard>
        <EnhancedSectionCard
          title="Comptes collaborateurs"
          isEditable={isCollaboratorsEditable}
          disabled={!isCollaboratorsEditable}
          buttonOnClickHref="/agencies-settings/collaborators"
          titleIconClass="fr-icon-team-fill"
          CustomBadge={<div />}
          status="TO_COMPLETE"
          customButtonTitle="Ajouter"
        >
          <p className="md:w-4/5">
            Vous avez besoin de collaborer à plusieurs sur la plateforme ?
            Ajoutez des comptes collaborateurs pour que vos collaborateurs
            puissent avoir accès à leurs candidatures.
          </p>
          {!isCollaboratorsEditable && (
            <SmallNotice>
              Vous pourrez ajouter des comptes collaborateurs une fois que vous
              aurez complété les paramètres précédents.
            </SmallNotice>
          )}
        </EnhancedSectionCard>
      </div>
    </div>
  );
};

export default AgenciesSettingsPage;
