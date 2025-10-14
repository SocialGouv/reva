"use client";
import Image from "next/image";

import mailPolygon from "./assets/mail-polygon.svg";

export default function ForgotPasswordConfirmationPage() {
  return (
    <div className="flex flex-col-reverse items-center md:flex-row md:justify-between gap-[50px]">
      <div>
        <h1>Un e-mail vous a été envoyé.</h1>
        <p className="text-xl leading-loose">
          Vous avez demandé la réinitialisation du mot de passe de votre compte
          France VAE.
        </p>
        <p className="text-sm">
          Si vous avez déjà un compte chez France VAE, vous allez recevoir un
          e-mail avec un lien pour réinitialiser votre mot de passe. <br />
          Si vous ne trouvez pas notre e-mail, pensez à vérifier votre dossier
          de courriers indésirables (spams).
        </p>
      </div>
      <Image src={mailPolygon} alt="icône application" />
    </div>
  );
}
