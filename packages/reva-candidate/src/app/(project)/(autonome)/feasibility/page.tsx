"use client";
import { PageLayout } from "@/layouts/page.layout";
import { SendFeasibilityForm } from "./_components/SendFeasibilityForm.component";


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
