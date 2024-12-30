"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import dropOutConfirmationImage from "./assets/dropout_confirmation_image.png";
import Image from "next/image";

export default function CandidacyDropOutConfirmationPage() {
  return (
    <div className="flex" data-test="candidacy-dropout-confirmation-page">
      <div className="flex flex-col mt-16 mb-5">
        <h1 className="text-dsfrGray-800">Votre parcours VAE est abandonné</h1>
        <p className="text-xl">
          Vous avez confirmé l’abandon de votre parcours VAE. Votre
          accompagnateur a été informé de votre décision.
        </p>
        <Button linkProps={{ href: "/" }}>Revenir à mon espace</Button>
      </div>
      <Image
        className="z-10 hidden md:block"
        alt="croix rouge dans un hexagone"
        style={{
          width: "282px",
          height: "318px",
        }}
        src={dropOutConfirmationImage}
      />
    </div>
  );
}
