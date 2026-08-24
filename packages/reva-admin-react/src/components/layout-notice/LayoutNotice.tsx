import { usePathname } from "next/navigation";

import { useAuth } from "../auth/auth";
import { useKeycloakContext } from "../auth/keycloakContext";

import { AapCgu } from "./_components/AppCgu.component";
import { useAppCgu } from "./_components/AppCgu.hooks";
import { GeneralInformationUpdateNotice } from "./_components/GeneralInformationUpdateNotice.component";

export const LayoutNotice = () => {
  const { authenticated } = useKeycloakContext();
  const { isGestionnaireMaisonMereAAP, isAdmin } = useAuth();

  const pathname = usePathname();

  const isCguPathname =
    pathname.startsWith("/information") || pathname.startsWith("/cgu");

  const { maisonMereCgu, getMaisonMereCGUisLoading } = useAppCgu();
  const canSeeAapCgu =
    authenticated &&
    isGestionnaireMaisonMereAAP &&
    !isCguPathname &&
    maisonMereCgu &&
    !maisonMereCgu.isLatestVersion;

  if (getMaisonMereCGUisLoading || isAdmin) {
    return null;
  }

  // `trailingSlash: true` côté Next: le slash final est à ignorer.
  const canSeeGeneralInformationUpdate =
    authenticated &&
    isGestionnaireMaisonMereAAP &&
    pathname.replace(/\/$/, "") === "/agencies-settings-v3";

  if (!canSeeAapCgu && !canSeeGeneralInformationUpdate) {
    return null;
  }

  return (
    <>
      {canSeeAapCgu && <AapCgu />}
      {canSeeGeneralInformationUpdate && <GeneralInformationUpdateNotice />}
    </>
  );
};
