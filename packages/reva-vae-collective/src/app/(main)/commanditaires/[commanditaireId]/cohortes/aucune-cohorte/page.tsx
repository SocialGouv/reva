import { Button } from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";

import applicationPolygon from "./assets/application-polygon.svg";

export default function AucuneCohortePage() {
  return (
    <div className="flex flex-col-reverse items-center md:flex-row gap-[50px]">
      <div>
        <h1>Bienvenue dans votre espace France VAE</h1>
        <p className="text-xl">
          Retrouvez ici toutes les cohortes que vous avez créées, et demandez
          l'accès à votre tableau de bord de pilotage de vos cohortes.
        </p>
        <p className="text-xl">Commencez en créant votre première cohorte.</p>
        <Button
          className="mt-4"
          linkProps={{
            href: "./nouvelle-cohorte",
          }}
        >
          Créer une cohorte
        </Button>
      </div>
      <div>
        <Image src={applicationPolygon} alt="icône application" />
      </div>
    </div>
  );
}
