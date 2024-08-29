import Link from "next/link";

import Notice from "@codegouvfr/react-dsfr/Notice";

import { usePathname } from "next/navigation";
import { useAppCgu } from "./AppCgu.hooks";

export const AapCgu = (): JSX.Element | null => {
  const pathname = usePathname();
  const isCguPathname =
    pathname.startsWith("/information") || pathname.startsWith("/cgu");

  const { getMaisonMereCGU } = useAppCgu();

  const cgu =
    getMaisonMereCGU.data?.account_getAccountForConnectedUser?.maisonMereAAP
      ?.cgu;

  if (isCguPathname || cgu?.isLatestVersion) {
    return null;
  }

  return (
    <Notice
      isClosable
      className="-mb-8"
      title={
        <>
          Votre accès à la plateforme est actuellement restreint. Vous pouvez
          consulter vos candidatures en cours, mais votre profil n'apparaît plus
          dans les recherches des nouveaux candidats. Pour recevoir de nouvelles
          candidatures, veuillez accepter les{" "}
          <Link href="/cgu">Conditions Générales d'Utilisation (CGU)</Link>.
        </>
      }
    />
  );
};
