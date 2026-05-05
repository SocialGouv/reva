import { Button } from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";

import { Panel } from "@/components/layout/Panel";
import { WEBSITE_BASE_URL } from "@/config/config";

export default function LogoutConfirmation() {
  return (
    <div data-testid="logout-confirmation" className="flex-1">
      <Panel>
        <div className="flex flex-row items-center justify-between gap-8">
          <div className="flex flex-col justify-center p-6">
            <h1 className="text-[2.5rem] font-bold text-dsfrGray-800">
              Vous avez bien été déconnecté de votre espace France VAE
            </h1>
            <div className="flex flex-row gap-4">
              <Button
                data-testid="logout-confirmation-back-to-home"
                className="mt-6"
                linkProps={{ href: WEBSITE_BASE_URL }}
              >
                Retourner à l'accueil
              </Button>
              <Button
                data-testid="logout-confirmation-reconnect"
                className="mt-6"
                priority="secondary"
                linkProps={{ href: "/candidat/login" }}
              >
                Se reconnecter
              </Button>
            </div>
          </div>
          <Image
            src="/candidat/images/error-hexagon.svg"
            alt="Hexagone rouge"
            width={282}
            height={319}
          />
        </div>
      </Panel>
    </div>
  );
}
