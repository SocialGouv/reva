import { Button } from "@codegouvfr/react-dsfr/Button";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { Metadata } from "next";

import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";

export const metadata: Metadata = {
  title: "France VAE | Commencer une VAE",
};

export default function CommencerPage() {
  return (
    <MainLayout>
      <div className="fr-container py-12">
        <div className="flex flex-col gap-12 max-w-6xl mx-auto">
          <div className="flex flex-col gap-6">
            <h1 className="mb-0">Commencer une VAE</h1>
            <p className="fr-text--lead mb-0">
              Vous souhaitez commencer un parcours de VAE via France VAE. Votre
              entreprise peut avoir mis en place une démarche de VAE collective.
              Renseignez-vous auprès de celle-ci avant de vous lancer, cela peut
              présenter des avantages conséquents pour vous.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Tile
              title="Ma démarche est personnelle"
              desc="VAE individuelle"
              linkProps={{
                href: "/espace-candidat",
              }}
              enlargeLinkOrButton
              orientation="vertical"
              imageUrl="/candidate-space/pictograms/avatar.svg"
              imageSvg
            />
            <Tile
              title="Je dispose d'un code VAE collective"
              desc="VAE collective"
              linkProps={{
                href: "/inscription-candidat/vae-collective",
              }}
              enlargeLinkOrButton
              orientation="vertical"
              imageUrl="/candidate-space/pictograms/company.svg"
              imageSvg
            />
          </div>

          <div className="flex flex-col gap-4">
            <hr className="fr-hr pb-1" />
            <div className="flex flex-row items-center justify-between px-2">
              <p className="font-semibold mb-0">
                Je dispose déjà d'un compte, je reprends où j'en étais.
              </p>
              <Button
                linkProps={{
                  href: "/candidat/login",
                }}
                priority="secondary"
                size="small"
              >
                Me connecter
              </Button>
            </div>
            <hr />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
