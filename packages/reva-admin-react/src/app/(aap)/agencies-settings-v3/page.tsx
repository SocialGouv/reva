"use client";
import { SettingsSummaryForCollaborateur } from "@/app/(aap)/agencies-settings-v3/_components/agencies-settings-summary/SettingsSummaryForCollaborateur";
import { SettingsSummaryForGestionnaire } from "@/app/(aap)/agencies-settings-v3/_components/agencies-settings-summary/SettingsSummaryForGestionnaire";
import { useAuth } from "@/components/auth/auth";
import { MaisonMereAap, Organism } from "@/graphql/generated/graphql";
import { useHeadyAgencySettings } from "./_components/agencies-settings-summary/settingsForGestionnaire.hook";

const AgenciesSettingsPage = () => {
  const { isGestionnaireMaisonMereAAP } = useAuth();
  const { maisonMereAAP, organism, accountId } = useHeadyAgencySettings();

  return (
    <div className="flex flex-col w-full">
      <h1>Paramètres</h1>
      {isGestionnaireMaisonMereAAP ? (
        <div className="w-full">
          <p className="text-xl">
            Complétez les paramètres de compte de votre structure pour recevoir
            vos premières candidatures.
          </p>
          <SettingsSummaryForGestionnaire
            maisonMereAAP={maisonMereAAP as MaisonMereAap}
            organism={organism as Organism}
            accountId={accountId as string}
          />
        </div>
      ) : (
        <SettingsSummaryForCollaborateur />
      )}
    </div>
  );
};

export default AgenciesSettingsPage;
