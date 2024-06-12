"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";

export default function InformationPage() {
  return (
    <>
      <div className="[&_p]:text-xl [&_p]:leading-relaxed">
        <h1>Nouveau mode de financement des parcours VAE</h1>
        <p>
          Le financement des parcours VAE évolue, les CGU également. Nous vous
          invitons à lire avec attention les informations suivantes, à lire
          attentivement les CGU et le cahier des charges et, à{" "}
          <a href="https://vae.gouv.fr/nous-contacter/">nous consulter</a> si
          vous avez besoin de précisions.
        </p>
        <hr className="mt-12 mb-6" />
      </div>
      <div className="[&_p]:text-lg [&_h3]:text-xl [&_li]:my-3">
        <h2>1 – Financement France VAE ou financement de droit commun ?</h2>
        <ul className="text-lg [&_ul]:list-[revert]">
          <li>
            La certification visée par le candidat relève des priorités fixées
            par l’Etat :
            <ul>
              <li>
                Le parcours du candidat est éligible au financement France VAE.
                Les demandes de prise en charge financière et les demandes de
                paiement se font dans votre espace professionnel.
              </li>
              <li>
                Vous reconnaîtrez les certifications concernées grâce au label “
                <strong>finançable France VAE</strong>” visibles sur les
                candidatures dans votre espace professionnelle.
              </li>
            </ul>
          </li>
          <li>
            La certification visée par le candidat relève des filières non
            prioritaires :
            <ul>
              <li>
                Le parcours du candidat relève des financements de droit commun
                (CPF, OPCO, Région, entreprises, France Travail…). Il vous
                appartient d’explorer avec le candidat les différents
                dispositifs de financement auxquels il peut prétendre et de
                l’accompagner sur les démarches à conduire. Les fonctionnalités
                “demande de prise en charge financière” et “demande de paiement”
                ne seront donc pas disponibles pour les parcours concernant ces
                certifications.
              </li>
              <li>
                Vous reconnaîtrez les certifications concernées grâce au label
                “finançable droit commun” visibles sur les candidatures dans
                votre espace professionnelle.
              </li>
            </ul>
          </li>
        </ul>
        <h2>2 – Conséquences pour les candidatures</h2>
        <h3>Les candidatures en cours</h3>
        <p>
          Que vous acceptiez ou non les nouvelles CGU, vous pourrez néanmoins
          poursuivre l’accompagnement des vos candidatures en cours.
        </p>
        <h3>Les nouvelles candidatures</h3>
        <p>
          Les nouvelles dispositions en matière de financement et CGU sont
          applicables à toute nouvelle candidature.
        </p>
        <p>
          Il conviendra donc que vous soyez attentif à repérer précocement le
          besoin en financement des nouvelles candidatures afin de rester un
          élément clé de la sécurisation des parcours des candidats.
        </p>
        <hr className="mt-12 mb-6" />
      </div>
      <div className="w-full flex justify-end">
        <Button priority="primary" linkProps={{ href: "/cgu" }}>
          Suivant
        </Button>
      </div>
    </>
  );
}
