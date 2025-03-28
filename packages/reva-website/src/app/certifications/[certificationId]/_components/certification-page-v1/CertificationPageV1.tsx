import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import Link from "next/link";

export const CertificationPageV1 = ({
  certification,
}: {
  certification: {
    id: string;
    label: string;
    isAapAvailable: boolean;
    codeRncp: string;
  };
}) => (
  <div className="flex-1 flex pb-8 min-h-screen">
    <div className="flex-1 bg-white w-full mx-auto flex flex-col gap-8 fr-container p-6 shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
      <Breadcrumb
        className="!mt-0 !-mb-2"
        currentPageLabel={certification?.label}
        segments={[
          {
            label: "Candidats",
            linkProps: {
              href: "/espace-candidat/",
            },
          },
        ]}
      />

      <div className="flex flex-col gap-2">
        <h1 className="m-0">{certification?.label}</h1>
        <div className="flex flex-row items-center gap-4">
          <span className="text-xs text-dsfrGray-mentionGrey">{`RNCP ${certification?.codeRncp}`}</span>

          <Tag small>
            {certification?.isAapAvailable
              ? "VAE en autonomie ou accompagnée"
              : "VAE en autonomie"}
          </Tag>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span>{`Vous souhaitez en savoir plus sur le diplôme de ${certification?.label} ?`}</span>
        <Link
          className="fr-link mr-auto"
          target="_blank"
          href={`https://www.francecompetences.fr/recherche/rncp/${certification?.codeRncp}`}
        >
          Consulter la fiche de ce diplôme sur le RNCP
        </Link>
      </div>

      <div>
        <Accordion
          className="[&_div]:pb-0"
          label="En savoir plus sur le parcours de VAE à réaliser en autonomie"
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="m-0">
                Réalisez votre projet seul, à votre rythme
              </h2>
              <ul className="text-lg">
                <li>Gestion flexible de votre progression</li>
                <li>Autonomie dans l’organisation de votre travail</li>
                <li>Maîtrise de votre calendrier</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="m-0">Les étapes clés en autonomie</h3>
              <ul className="text-lg">
                <li>Constitution de votre dossier de faisabilité</li>
                <li>Communication directe avec le certificateur</li>
                <li>Recherche de formations complémentaires si besoin</li>
                <li>Élaboration de votre dossier de validation</li>
                <li>Auto-préparation à l'entretien avec le jury</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="m-0">Financement</h3>
              <ul className="text-lg">
                <li>Frais de jury à prévoir</li>
                <li>Coûts éventuels de formation complémentaire</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="m-0">Ressources à votre disposition</h4>
              <div className="flex flex-col gap-2">
                <Link
                  className="fr-link mr-auto"
                  target="_blank"
                  href="https://vae.gouv.fr/savoir-plus/articles/parcours_VAE_sans_accompagnement/"
                >
                  Guide complet de la VAE en autonomie
                </Link>
                <Link
                  className="fr-link mr-auto"
                  target="_blank"
                  href="https://scribehow.com/shared/Tutoriel__Candidat_sans_accompagnement_autonome__0NQyq175SDaI0Epy7bdyLA?referrer=documents"
                >
                  Tutoriel détaillé pour tout comprendre sur le parcours VAE en
                  autonomie
                </Link>
                <Link
                  className="fr-link mr-auto"
                  target="_blank"
                  href="https://vae.gouv.fr/savoir-plus/articles/financer-son-accompagnement-vae/"
                >
                  Comment financer son accompagnement VAE ?
                </Link>
                <Link
                  className="fr-link mr-auto"
                  target="_blank"
                  href="https://vae.gouv.fr/savoir-plus/articles/comment-bien-choisir-son-diplome/"
                >
                  Comment bien choisir son diplôme ?
                </Link>
              </div>
            </div>
          </div>
        </Accordion>
        {certification?.isAapAvailable && (
          <Accordion
            className="[&_div]:pb-0"
            label="En savoir plus sur le parcours de VAE à réaliser avec un accompagnateur"
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h2 className="m-0">
                  Un suivi personnalisé pour réussir votre VAE
                </h2>
                <ul className="text-lg">
                  <li>Accompagnement expert à chaque étape clé du parcours</li>
                  <li>Rythme adapté à vos disponibilités et besoins</li>
                  <li>Optimisation de vos chances de réussite</li>
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="m-0">L’accompagnateur vous guide pour :</h3>
                <ul className="text-lg">
                  <li>Rédiger et transmettre votre dossier de faisabilité</li>
                  <li>Échanger efficacement avec le certificateur</li>
                  <li>Construire un dossier de validation solide</li>
                  <li>Préparer votre entretien avec le jury</li>
                  <li>
                    Identifier les formations complémentaires si nécessaire
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="m-0">Financement</h3>
                <ul className="text-lg">
                  <li>Financement possible par votre CPF</li>
                  <li>Prise en charge partielle selon votre situation</li>
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="m-0">Ressources à votre disposition</h4>
                <div className="flex flex-col gap-2">
                  <Link
                    className="fr-link mr-auto"
                    target="_blank"
                    href="https://scribehow.com/shared/Parcours_candidat__vp9k4YzATvmheao9kAoKjw"
                  >
                    Tutoriel détaillé pour tout comprendre sur le parcours VAE
                    accompagné
                  </Link>
                  <Link
                    className="fr-link mr-auto"
                    target="_blank"
                    href="https://vae.gouv.fr/savoir-plus/articles/financer-son-accompagnement-vae/"
                  >
                    Comment financer son accompagnement VAE ?
                  </Link>
                  <Link
                    className="fr-link mr-auto"
                    target="_blank"
                    href="https://vae.gouv.fr/savoir-plus/articles/comment-bien-choisir-son-diplome/"
                  >
                    Comment bien choisir son diplôme ?
                  </Link>
                </div>
              </div>
            </div>
          </Accordion>
        )}
      </div>

      <Button
        priority="primary"
        linkProps={{
          href: `/inscription-candidat/?certificationId=${certification?.id}`,
        }}
      >
        Commencer mon parcours VAE pour ce diplôme
      </Button>
    </div>
  </div>
);
