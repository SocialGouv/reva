"use client";
import { useAuth } from "@/components/auth/auth";
import { HeadAgencySettingsSummary } from "@/app/(aap)/agencies-settings-v3/_components/agencies-settings-summary/HeadAgencySettingsSummary";
import { AgencySettingsSummary } from "@/app/(aap)/agencies-settings-v3/_components/agencies-settings-summary/AgencySettingsSummary";

const AgenciesSettingsPage = () => {
  const { isGestionnaireMaisonMereAAP } = useAuth();

  return (
    <div className="flex flex-col w-full">
      <h1>Paramètres</h1>
      <p>
        Retrouvez ici les informations renseignées lors de l'inscription. Vous
        pouvez signaler un changement au support si ces informations ne sont
        plus à jour.
      </p>
      <div className="flex flex-col gap-8 mt-6">
        {isGestionnaireMaisonMereAAP ? (
          <HeadAgencySettingsSummary />
        ) : (
          <AgencySettingsSummary />
        )}
      </div>
    </div>
  );
};

export default AgenciesSettingsPage;
