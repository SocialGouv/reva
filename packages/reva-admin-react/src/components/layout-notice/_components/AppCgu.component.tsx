import Notice from "@codegouvfr/react-dsfr/Notice";
import Link from "next/link";

export const AapCgu = () => {
  return (
    <Notice
      data-testid="new-cgu-notice"
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
