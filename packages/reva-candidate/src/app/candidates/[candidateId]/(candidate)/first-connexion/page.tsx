import { Button } from "@codegouvfr/react-dsfr/Button";

import { WelcomePage } from "@/app/_components/welcome-page/WelcomePage";
import { PICTOGRAMS } from "@/components/pictograms/Pictograms";

export default function FirstConnexionPage() {
  return (
    <WelcomePage
      title="Bienvenue dans votre espace France VAE"
      description="Pour y accéder, vous devez vérifier et compléter vos informations de profil."
      pictogram={PICTOGRAMS.informationLG}
      content={
        <div className="text-sm mb-6">
          <p className="block text-sm mb-8">
            Cette étape ne vous prendra que quelques minutes, munissez vous de :
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
  );
}
