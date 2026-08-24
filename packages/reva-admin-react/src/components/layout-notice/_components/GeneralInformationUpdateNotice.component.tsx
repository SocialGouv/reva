import Notice from "@codegouvfr/react-dsfr/Notice";
import Link from "next/link";

import { useGestionnaireMaisonMereAAPSettings } from "@/app/(private)/(aap)/agencies-settings-v3/_components/agencies-settings-summary/settingsForGestionnaire.hook";

export const GeneralInformationUpdateNotice = () => {
  const { maisonMereAAP } = useGestionnaireMaisonMereAAPSettings();

  if (
    maisonMereAAP?.statutValidationInformationsJuridiquesMaisonMereAAP !==
    "A_METTRE_A_JOUR"
  ) {
    return null;
  }

  return (
    <Notice
      title={
        <>
          Votre compte doit être mis à jour. Retrouvez les documents à
          renseigner dans la catégorie{" "}
          <Link
            href={`/agencies-settings-v3/${maisonMereAAP.id}/general-information`}
          >
            Paramètres/Informations générales.
          </Link>
        </>
      }
    />
  );
};
