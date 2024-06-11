import Link from "next/link";

import Notice from "@codegouvfr/react-dsfr/Notice";

import { useAppCgu } from "./AppCgu.hooks";
import { useFeatureflipping } from "../feature-flipping/featureFlipping";
import { usePathname } from "next/navigation";

export const AapCgu = (): JSX.Element | null => {
  const { isFeatureActive } = useFeatureflipping();

  const isFeatureAapCguActive = isFeatureActive("AAP_CGU");

  const pathname = usePathname();
  const isCguPathname =
    pathname.startsWith("/information") || pathname.startsWith("/cgu");

  const { getMaisonMereCGU } = useAppCgu();

  const cgu =
    getMaisonMereCGU.data?.account_getAccountForConnectedUser?.maisonMereAAP
      ?.cgu;

  if (
    !isFeatureAapCguActive ||
    isCguPathname ||
    (cgu?.version != undefined && cgu.version == 1)
  ) {
    return null;
  }

  return (
    <Notice
      isClosable
      title={
        <>
          Votre utilisation de la plateforme est limitée. Vous pouvez accéder à
          vos candidatures en cours mais n’apparaissez plus dans les recherches
          des futurs candidats. Si vous souhaitez recevoir de nouvelles
          candidatures, vous devez accepter nos{" "}
          <Link href="/information">Conditions Générales d’Utilisation</Link>.
        </>
      }
    />
  );
};
