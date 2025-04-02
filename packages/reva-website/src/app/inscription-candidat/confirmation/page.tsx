"use client";
import { CandidateBackground } from "@/components/layout/full-height-blue-layout/CandidateBackground";
import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { PICTOGRAMS } from "@/components/pictograms";
import hexagonBackground from "@/components/pictograms/assets/hexagonBackground.svg";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";

export default function CandidateRegistrationConfirmationPage() {
  return (
    <MainLayout>
      <CandidateBackground>
        <div className="flex pt-6 pb-4">
          <div className="flex-1 py-6">
            <h1>
              Votre demande de création de compte a bien été enregistrée !
            </h1>
            <div className="pr-24 mb-10">
              <p className="fr-text--lead">
                Un lien d'activation (valable pendant 3 heures) va se glisser
                dans votre boîte mail dans quelques instants.
              </p>
              <p className="fr-text--sm">
                Attention, nos mails peuvent se perdre dans votre dossier de
                courrier indésirable (spams). Si vous avez la moindre question,
                vous pouvez nous contacter à l'adresse :{" "}
                <a href="mailto:support@vae.gouv.fr">support@vae.gouv.fr</a>
              </p>
            </div>
            <Button priority="secondary" linkProps={{ href: "/" }}>
              Retour à la page d'accueil
            </Button>
          </div>
          <div className="my-6 relative flex items-center justify-center w-[282px] h-[319px]">
            <Image
              src={hexagonBackground}
              className="absolute inset-0"
              alt=""
            />
            <div className="z-10">{PICTOGRAMS.mailSendLG}</div>
          </div>
        </div>
      </CandidateBackground>
    </MainLayout>
  );
}
