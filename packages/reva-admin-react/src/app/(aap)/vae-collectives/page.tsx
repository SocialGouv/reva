"use client";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";

import { useVAECollectivesPage } from "./vaeCollectives.hook";

export default function VAECollectivePage() {
  const { cohortes } = useVAECollectivesPage();

  if (!cohortes) {
    return null;
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col flex-1 md:flex-row gap-10 md:gap-0">
        <nav
          role="navigation"
          aria-label="Menu latéral"
          className="flex flex-col gap-4"
        >
          <SideMenu
            className="flex-shrink-0 flex-grow-0 md:basis-[400px]"
            align="left"
            burgerMenuButtonText="Candidatures"
            items={cohortes.map((cohorte) => ({
              text: cohorte.nom,
              linkProps: { href: `/vae-collectives` },
              items: [
                {
                  text: "Candidatures actives",
                  linkProps: {
                    href: `/vae-collectives?cohorte_id=${cohorte.id}&status=ACTIVE_HORS_ABANDON`,
                  },
                },
                {
                  text: "Candidatures en jury",
                  linkProps: {
                    href: `/vae-collectives?cohorte_id=${cohorte.id}&status=JURY_HORS_ABANDON`,
                  },
                },
                {
                  text: "Candidatures non recevables",
                  linkProps: {
                    href: `/vae-collectives?cohorte_id=${cohorte.id}&status=DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON`,
                  },
                },
                {
                  text: "Candidatures abandonnées",
                  linkProps: {
                    href: `/vae-collectives?cohorte_id=${cohorte.id}&status=ABANDON`,
                  },
                },
                {
                  text: "Candidatures réorientées",
                  linkProps: {
                    href: `/vae-collectives?cohorte_id=${cohorte.id}&status=REORIENTEE`,
                  },
                },
              ],
            }))}
          />
        </nav>
        <div className="mt-3 flex-1">
          <h1>Candidatures VAE collective</h1>
          <p>
            Retrouvez toutes les candidatures en VAE collective en fonction de
            leur état d’avancement.
          </p>
        </div>
      </div>
    </div>
  );
}
