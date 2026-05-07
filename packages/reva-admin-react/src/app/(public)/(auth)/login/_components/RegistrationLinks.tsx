import { Button } from "@codegouvfr/react-dsfr/Button";

import { WEBSITE_BASE_URL } from "@/config/config";

export const RegistrationLinks = () => (
  <div className="flex flex-col gap-8">
    <div className="basis-1/2 max-w-lg flex flex-col">
      <p className="text-xl font-bold">
        Vous êtes Architecte Accompagnateur de Parcours, et vous n’avez pas
        encore créé votre compte ?
      </p>

      <div className="flex flex-col items-center gap-4">
        <Button
          className="w-full justify-center"
          priority="secondary"
          linkProps={{
            href: `${WEBSITE_BASE_URL}/savoir-plus/articles/espace-architecte-accompagnateur-de-parcours/`,
            className: "after:content-none",
          }}
        >
          Espace Architecte Accompagnateur de Parcours
        </Button>
      </div>
    </div>
    <div className="basis-1/2 max-w-lg flex flex-col">
      <p className="text-xl font-bold">
        Vous êtes certificateur et vous n’avez pas encore créé votre compte ?
      </p>

      <div className="flex flex-col items-center gap-4">
        <Button
          className="w-full justify-center"
          priority="secondary"
          linkProps={{
            href: `${WEBSITE_BASE_URL}/savoir-plus/articles/espace-certificateurs/`,
            className: "after:content-none",
          }}
        >
          Espace Certificateur
        </Button>
      </div>
    </div>
  </div>
);
