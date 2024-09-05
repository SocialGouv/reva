"use client";
import { useAuth } from "@/components/auth/auth";
import { HeadAgencySettingsSummary } from "@/app/(aap)/agencies-settings-v3/_components/agencies-settings-summary/HeadAgencySettingsSummary";
import { AgencySettingsSummary } from "@/app/(aap)/agencies-settings-v3/_components/agencies-settings-summary/AgencySettingsSummary";

const AgenciesSettingsPage = () => {
  const { isGestionnaireMaisonMereAAP } = useAuth();

  return (
    <div className="flex flex-col w-full">
      <h1>Paramètres</h1>
      {isGestionnaireMaisonMereAAP ? (
        <HeadAgencySettingsSummary />
      ) : (
        <AgencySettingsSummary />
      )}
    </div>
  );
};

export default AgenciesSettingsPage;
