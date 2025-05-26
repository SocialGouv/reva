import Link from "next/link";

import Notice from "@codegouvfr/react-dsfr/Notice";

export const AapCgu = (): JSX.Element | null => {
  return (
    <Notice
      data-test="new-cgu-notice"
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
