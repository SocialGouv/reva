"use client";
import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { useAgenciesSettings } from "./_components/agenciesSettings.hook";
import { useAuth } from "@/components/auth/auth";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { RemoteZone } from "@/graphql/generated/graphql";

const AgenciesSettingsPage = () => {
  const { maisonMereAAP, organism } = useAgenciesSettings();
  const { isGestionnaireMaisonMereAAP } = useAuth();
  const isGeneralInformationCompleted =
    maisonMereAAP?.statutValidationInformationsJuridiquesMaisonMereAAP ===
    "A_JOUR";
  const isCollaboratorsEditable = isGeneralInformationCompleted;

  const remoteAgency = organism?.isRemote
    ? organism
    : maisonMereAAP?.organisms.find((o) => o.isRemote);

  const getRemoteZoneLabel = (remoteZone: RemoteZone) => {
    switch (remoteZone) {
      case "FRANCE_METROPOLITAINE":
        return "France métropolitaine (UTC+2)";
      case "GUADELOUPE":
        return "Guadeloupe (UTC-4)";
      case "GUYANE":
        return "Guyane (UTC-3)";
      case "LA_REUNION":
        return "La Réunion (UTC+4)";
      case "MARTINIQUE":
        return "Martinique (UTC-4)";
      case "MAYOTTE":
        return "Mayotte (UTC+3)";
      case "SAINTE_LUCIE_SAINT_MARTIN":
        return "Saint-Pierre-et-Miquelon (UTC-2)";
      case "SAINT_PIERRE_ET_MIQUELON":
        return "Sainte-Lucie / Saint-Martin (UTC-4)";
    }
  };

  return (
    <div className="flex flex-col w-full">
      <h1>Paramètres</h1>
      <p>
        Retrouvez ici les informations renseignées lors de l'inscription. Vous
        pouvez signaler un changement au support si ces informations ne sont
        plus à jour.
      </p>
      <div className="flex flex-col gap-8 mt-6">
        {isGestionnaireMaisonMereAAP && (
          <EnhancedSectionCard
            title="Informations générales"
            status={isGeneralInformationCompleted ? "COMPLETED" : "TO_COMPLETE"}
            isEditable
            buttonOnClickHref="/agencies-settings-v3/general-information"
            titleIconClass="fr-icon-information-fill"
          />
        )}
        {remoteAgency &&
          (isGestionnaireMaisonMereAAP || organism?.isRemote) && (
            <EnhancedSectionCard
              title="Accompagnement à distance"
              buttonOnClickHref={`/agencies-settings-v3/organisms/${remoteAgency.id}/remote`}
              isEditable={true}
              titleIconClass="fr-icon-headphone-fill"
            >
              <div className="pl-10 flex flex-col gap-4">
                <Badge
                  small
                  severity={
                    remoteAgency.isVisibleInCandidateSearchResults
                      ? "success"
                      : "error"
                  }
                >
                  {remoteAgency.isVisibleInCandidateSearchResults
                    ? "Visible"
                    : "Invisible"}
                </Badge>
                <ul className="list-none pl-0 flex flex-col gap-2">
                  {remoteAgency.remoteZones.map((r) => (
                    <li key={r}>{getRemoteZoneLabel(r)}</li>
                  ))}
                </ul>
              </div>
            </EnhancedSectionCard>
          )}

        {isGestionnaireMaisonMereAAP && (
          <EnhancedSectionCard
            title="Accompagnement en présentiel"
            buttonOnClickHref="/agencies-settings-v3/on-site"
            titleIconClass="fr-icon-home-4-fill"
            isEditable
          >
            <p className="md:w-4/5">
              Vous avez des collaborateurs qui font des accompagnements en
              présentiel ? Ajoutez les lieux d'accueil dans lesquels se rendront
              les candidats.
            </p>
          </EnhancedSectionCard>
        )}
        {!isGestionnaireMaisonMereAAP && organism?.isRemote === false && (
          <EnhancedSectionCard
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

        {isGestionnaireMaisonMereAAP ? (
          <EnhancedSectionCard
            title="Comptes collaborateurs"
            isEditable={isCollaboratorsEditable}
            disabled={!isCollaboratorsEditable}
            buttonOnClickHref="/agencies-settings-v3/user-accounts/add-user-account"
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
                Vous pourrez ajouter des comptes collaborateurs une fois que
                vous aurez complété les paramètres précédents.
              </SmallNotice>
            )}
          </EnhancedSectionCard>
        ) : (
          <EnhancedSectionCard
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
        )}
      </div>
    </div>
  );
};

export default AgenciesSettingsPage;
