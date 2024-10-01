"use client";
import { PageLayout } from "@/layouts/page.layout";
import { SendFeasibilityForm } from "./_components/SendFeasibilityForm.component";

export const DownloadTile = ({
  name,
  description,
  url,
  mimeType,
}: {
  name: string;
  description?: string;
  url: string;
  mimeType: string;
}) => {
  return (
    <div className="fr-tile fr-tile--download fr-enlarge-link">
      <div className="fr-tile__body">
        <div className="fr-tile__content">
          <h3 className="fr-tile__title">
            <a href={url} target="_blank">
              {name}
            </a>
          </h3>
          <p className="fr-card__desc text-base">{description}</p>
          <div className="fr-card__end">
            <p className="fr-tile__detail">
              {mimeType.split("/").pop()?.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Feasibility() {
  return (
    <PageLayout title="Dosier de faisabilité" displayBackToHome>
      <h1 className="mt-8">Dosier de faisabilité</h1>
      <p className="text-xl">
        Téléchargez la trame du dossier de faisabilité afin de le remplir avant
        de l’envoyer à votre certificateur. S’il n’est pas renseigné vous pouvez
        alors le choisir ci dessous. En cas de besoin, consultez la
        documentation suivante :
      </p>
      <p>
        <a
          href="https://scribehow.com/shared/Tutoriel__Candidats_sans_AAP_autonome__0NQyq175SDaI0Epy7bdyLA"
          target="_blank"
          className="text-dsfrBlue-500"
        >
          Notice d’utilisation du dossier de faisabilité
        </a>
      </p>
      <SendFeasibilityForm />
    </PageLayout>
  );
}
