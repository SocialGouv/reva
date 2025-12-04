"use client";
import { useParams } from "next/navigation";

import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { AAPSettingsSummarySectionRemote } from "@/components/settings/aap-settings-summary-section-remote/AAPSettingsSummarySectionRemote";

import { useCollaborateurSettingsPage } from "./collaborateurSettingsPage.hook";

export default function CollaborateurSettingsPage() {
  const { collaborateurUserAccountId } = useParams<{
    collaborateurUserAccountId: string;
  }>();
  const { remoteOrganism, maisonMereAAPId } = useCollaborateurSettingsPage({
    collaborateurUserAccountId,
  });
  return (
    <div className="flex flex-col w-full">
      <h1>Paramètres</h1>
      <p className="text-xl">
        Retrouvez ici les informations liées à vos modalités d’accompagnement et
        à votre connexion.
      </p>

      <div className="flex flex-col gap-8 mt-4">
        <EnhancedSectionCard
          data-testid="informations-connexion-summary-card"
          title="Informations de connexion"
          titleIconClass="fr-icon-info-fill"
          isEditable
          buttonOnClickHref="informations-connexion"
          customButtonTitle="Visualiser"
        />

        <AAPSettingsSummarySectionRemote
          organism={remoteOrganism}
          detailsPageUrl={`/agencies-settings-v3/${maisonMereAAPId}/organisms/${remoteOrganism?.id}/remote/`}
        />
      </div>
    </div>
  );
}
