import { Button } from "@codegouvfr/react-dsfr/Button";

import { StatusPage } from "@/app/_components/status-page/StatusPage";
import { PICTOGRAMS } from "@/components/pictograms/Pictograms";

export default function FirstConnexionPage() {
  return (
    <div className="bg-white lg:shadow-lifted w-full">
      <StatusPage
        title="Bienvenue dans votre espace France VAE"
        description={
          <p className="text-xl mb-0">
            Pour y accéder, vous devez vérifier et compléter vos informations de
            profil.
          </p>
        }
        pictogram={PICTOGRAMS.informationLG}
        content={
          <div className="text-sm">
            <p className="block text-sm">
              Cette étape ne vous prendra que quelques minutes, munissez vous de
              :
            </p>
            <ul>
              <li>
                vos informations civiles (nom(s), prénom(s), informations de
                naissance, nationalité)
              </li>
              <li>
                vos informations de contact (adresse postale, téléphone, adresse
                électronique)
              </li>
            </ul>
          </div>
        }
        buttons={
          <Button
            priority="primary"
            linkProps={{ href: "../profile?navigationDisabled=true" }}
          >
            Mon profil
          </Button>
        }
      />
    </div>
  );
}
