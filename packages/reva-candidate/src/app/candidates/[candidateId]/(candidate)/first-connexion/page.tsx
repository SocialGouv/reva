import Link from "next/link";

import { StatusPage } from "@/app/_components/status-page/StatusPage";
import { PICTOGRAMS } from "@/components/pictograms/Pictograms";

export default function FirstConnexionPage() {
  return (
    <StatusPage
      title="Bienvenue dans votre espace France VAE"
      chapo="Pour y accéder, vous devez vérifier et compléter vos informations de profil."
      details={
        <>
          <p className="mb-0">
            Cette étape ne vous prendra que quelques minutes, munissez vous de :
          </p>
          <ul className="mb-0">
            <li>
              vos informations civiles (nom(s), prénom(s), informations de
              naissance, nationalité)
            </li>
            <li>
              vos informations de contact (adresse postale, téléphone, adresse
              électronique)
            </li>
            <li>
              la convention collective (IDCC) à laquelle vous êtes rattaché(e),
              vous pouvez la trouver sur vos bulletins de paie, votre contrat de
              travail ou sur le{" "}
              <Link
                className="fr-link"
                href="https://code.travail.gouv.fr/outils/convention-collective"
                target="_"
              >
                site du code du travail
              </Link>
              .
            </li>
          </ul>
        </>
      }
      pictogram={PICTOGRAMS.informationLG}
      actionLink={{
        href: "./civil-informations",
        label: "Mon profil",
        priority: "primary",
      }}
    />
  );
}
