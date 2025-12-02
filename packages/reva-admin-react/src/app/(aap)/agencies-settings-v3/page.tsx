"use client";

import { useRouter } from "next/navigation";

import { SettingsSummaryForCollaborateur } from "@/app/(aap)/agencies-settings-v3/_components/agencies-settings-summary/settings-summary-for-collaborateur/SettingsSummaryForCollaborateur";
import { SettingsSummaryForGestionnaire } from "@/app/(aap)/agencies-settings-v3/_components/agencies-settings-summary/SettingsSummaryForGestionnaire";
import { useAuth } from "@/components/auth/auth";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";

import { MaisonMereAap, Organism } from "@/graphql/generated/graphql";

import { useGestionnaireMaisonMereAAPSettings } from "./_components/agencies-settings-summary/settingsForGestionnaire.hook";
import { useAgenciesSettingsPage } from "./agenciesSettingsPage.hook";

const AgenciesSettingsPage = () => {
  const { isGestionnaireMaisonMereAAP, isAdmin } = useAuth();
  const { isFeatureActive } = useFeatureflipping();
  const isUserAccountV2Featureactive = isFeatureActive("AAP_USER_ACCOUNT_V2");
  const router = useRouter();
  const { account } = useAgenciesSettingsPage();

  if (!account) {
    return null;
  }

  if (isUserAccountV2Featureactive && !isGestionnaireMaisonMereAAP && account) {
    router.push(`/agencies-settings-v3/collaborateurs/${account.id}`);
  }

  return (
    <div className="flex flex-col w-full">
      <h1>Paramètres</h1>
      {isGestionnaireMaisonMereAAP ? (
        <div className="w-full">
          <p className="text-xl">
            Complétez ou modifiez les paramètres de compte de votre structure
            pour recevoir vos premières candidatures.
          </p>
          <SettingsSummaryForGestionnaireSection isAdmin={isAdmin} />
        </div>
      ) : (
        <SettingsSummaryForCollaborateur />
      )}
    </div>
  );
};

export default AgenciesSettingsPage;

const SettingsSummaryForGestionnaireSection = ({
  isAdmin,
}: {
  isAdmin: boolean;
}) => {
  const {
    maisonMereAAP,
    comptesCollaborateurs,
    organism,
    gestionnaireAccountId,
  } = useGestionnaireMaisonMereAAPSettings();

  if (!maisonMereAAP || !comptesCollaborateurs || !organism) {
    return null;
  }

  return (
    <SettingsSummaryForGestionnaire
      maisonMereAAP={maisonMereAAP as MaisonMereAap}
      organism={organism as Organism}
      gestionnaireAccountId={gestionnaireAccountId as string}
      isAdmin={isAdmin}
      comptesCollaborateurs={comptesCollaborateurs}
    />
  );
};
