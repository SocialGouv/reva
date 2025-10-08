import Button from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";

import { PageLayout } from "@/layouts/page.layout";

export default function CandidacySubmissionSuccessNotice() {
  return (
    <PageLayout title="Parcours et financement">
      <div className="grid grid-cols-3 grid-rows-1 h-full w-11/12 mx-auto">
        <div className="col-span-2 my-auto">
          <h1>Candidature envoyée</h1>
          <p className="text-lg">
            Votre candidature a bien été envoyée à votre accompagnateur.
          </p>
          <p className="text-sm mb-0">
            Votre accompagnateur vous enverra prochainement un date de
            rendez-vous pour parler de votre projet. <br />
            Si vous n'avez toujours pas eu de retour 2 semaines après l'envoi de
            votre candidatures, contactez-le directement par mail.
          </p>
          <Button
            className="mt-10"
            linkProps={{
              href: "../",
            }}
          >
            Revenir à la candidature
          </Button>
        </div>
        <div className="m-auto">
          <Image
            src="/candidat/images/letter-with-sent-icon.png"
            alt="Enveloppe avec symbole validé"
            width={282}
            height={319}
          />
        </div>
      </div>
    </PageLayout>
  );
}
