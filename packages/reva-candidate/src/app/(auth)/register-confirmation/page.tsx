"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";

import hexagonBackground from "@/app/_components/welcome-page/assets/hexagonBackground.svg";
import { PICTOGRAMS } from "@/components/pictograms/Pictograms";
import { PageLayout } from "@/layouts/page.layout";

export default function RegisterConfirmation() {
  return (
    <PageLayout title="Confirmation d'inscription">
      <div className="bg-white shadow-lifted px-6 py-10 w-full">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-10 flex-1">
            <div className="flex flex-col gap-6">
              <h1 className="mb-0">Dernière étape, activez votre compte !</h1>

              <p className="fr-text--lead mb-0 max-w-[800px] text-dsfrGray-700">
                Votre demande de création de compte a bien été enregistrée.{" "}
                <strong>
                  Pour l'activer, cliquez sur le lien contenu dans le courriel
                </strong>{" "}
                que nous venons de vous envoyer. Attention, ce lien est valable
                3 heures.
              </p>

              <p className="text-sm mb-0 max-w-[800px] text-dsfrGray-700">
                Attention, nos courriels peuvent se perdre dans votre dossier de
                courrier indésirable (spams). Si vous avez la moindre question,
                vous pouvez nous contacter à l'adresse électronique :{" "}
                <a
                  href="mailto:support@vae.gouv.fr"
                  className="fr-link fr-link--sm"
                >
                  support@vae.gouv.fr
                </a>
              </p>
            </div>

            <div>
              <Button priority="secondary" linkProps={{ href: "/" }}>
                Retour à la page d'accueil
              </Button>
            </div>
          </div>

          <div className="shrink-0 hidden lg:flex relative items-center justify-center w-[208px] h-[234px]">
            <Image
              src={hexagonBackground}
              className="absolute inset-0"
              alt=""
            />
            <div className="z-10">{PICTOGRAMS.mailSendLG}</div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
