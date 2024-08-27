"use client";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";

const AgenciesSettingsPage = () => {
  const { isFeatureActive } = useFeatureflipping();
  const isSettingsEnabled = isFeatureActive("AAP_SETTINGS");
  if (!isSettingsEnabled) {
    return null;
  }
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
          status="TO_COMPLETE"
          isEditable
          buttonOnClickHref="/agencies-settings/general-information"
          titleIconClass="fr-icon-information-fill"
        />
        <EnhancedSectionCard
          title="Accompagnement à distance"
          status="TO_COMPLETE"
          isEditable
          buttonOnClickHref="/agencies-settings/remote"
          titleIconClass="fr-icon-headphone-fill"
        />
        <EnhancedSectionCard
          title="Accompagnement en présentiel"
          status="TO_COMPLETE"
          isEditable
          buttonOnClickHref="/agencies-settings/on-site"
          titleIconClass="fr-icon-home-4-fill"
        >
          <p className="md:w-4/5">
            Vous avez des collaborateurs qui font des accompagnements en
            présentiel ? Ajoutez les lieux d'accueil dans lesquels se rendront
            les candidats.
          </p>
        </EnhancedSectionCard>
        <EnhancedSectionCard
          title="Comptes collaborateurs"
          status="TO_COMPLETE"
          isEditable={false}
          disabled
          buttonOnClickHref="/agencies-settings/collaborators"
          titleIconClass="fr-icon-team-fill"
        >
          <p className="md:w-4/5">
            Vous avez besoin de collaborer à plusieurs sur la plateforme ?
            Ajoutez des comptes collaborateurs pour que vos collaborateurs
            puissent avoir accès à leurs candidatures.
          </p>
        </EnhancedSectionCard>
      </div>
    </div>
  );
};

export default AgenciesSettingsPage;
