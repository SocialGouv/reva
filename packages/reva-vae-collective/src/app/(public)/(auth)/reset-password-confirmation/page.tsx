import { Button } from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";

import checkPolygon from "./assets/check-polygon.svg";

export default async function ResetPasswordConfirmation() {
  return (
    <div className="flex flex-col-reverse items-center md:flex-row md:justify-between gap-[50px]">
      <div>
        <h1>Votre mot de passe a bien été réinitialisé.</h1>
        <Button className="mt-6" linkProps={{ href: "/login" }}>
          Se connecter
        </Button>
      </div>
      <Image src={checkPolygon} alt="icône application" />
    </div>
  );
}
