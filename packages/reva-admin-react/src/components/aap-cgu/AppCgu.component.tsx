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

  if (!isFeatureAapCguActive || isCguPathname || cgu?.isLatestVersion) {
    return null;
  }

  return (
    <Notice
      isClosable
      title={
        <>
          Votre accès à la plateforme est actuellement restreint. Vous pouvez
          consulter vos candidatures en cours, mais votre profil n'apparaît plus
          dans les recherches des nouveaux candidats. Pour recevoir de nouvelles
          candidatures, veuillez accepter les{" "}
          <Link href="/information">
            Conditions Générales d'Utilisation (CGU)
          </Link>
          .
        </>
      }
    />
  );
};
