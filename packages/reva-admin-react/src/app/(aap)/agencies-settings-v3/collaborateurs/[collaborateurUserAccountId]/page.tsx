import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";

export default function CollaborateurSettingsPage() {
  return (
    <div className="flex flex-col w-full">
      <h1>Paramètres</h1>
      <p className="text-xl">
        Retrouvez ici les informations liées à vos modalités d’accompagnement et
        à votre connexion.
      </p>

      <EnhancedSectionCard
        data-testid="informations-connexion-summary-card"
        title="Informations de connexion"
        titleIconClass="fr-icon-info-fill"
        isEditable
        buttonOnClickHref="informations-connexion"
        customButtonTitle="Visualiser"
      />
    </div>
  );
}
