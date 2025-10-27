"use client";
import { PageLayout } from "@/layouts/page.layout";

import { SendFeasibilityForm } from "./_components/SendFeasibilityForm.component";

export default function Feasibility() {
  return (
    <PageLayout title="Dosier de faisabilité">
      <h1 className="mt-8">Dossier de faisabilité</h1>
      <p className="text-xl">
        Téléchargez, remplissez puis envoyez votre dossier de faisabilité au
        certificateur. Si vous avez déjà une recevabilité, vous pouvez
        téléverser votre courrier de recevabilité à la place du dossier de
        faisabilité.
      </p>
      <p>
        <a
          href="https://scribehow.com/shared/Tutoriel__Candidats_sans_AAP_autonome__0NQyq175SDaI0Epy7bdyLA"
          target="_blank"
          className="text-dsfrBlue-500"
        >
          Besoin d&apos;aide ? Consultez le tutoriel “Parcours VAE en autonomie”
        </a>
      </p>
      <SendFeasibilityForm />
    </PageLayout>
  );
}
