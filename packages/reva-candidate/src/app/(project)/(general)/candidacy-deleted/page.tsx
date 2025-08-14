import Button from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";

import { PageLayout } from "@/layouts/page.layout";

export default function CandidacyDeletedPage() {
  return (
    <PageLayout
      title="Candidature supprimée"
      className="flex items-center justify-between"
    >
      <div>
        <h2 className="mb-6">Votre candidature a été supprimée</h2>
        <p className="text-xl mb-10">
          Vous pourrez de nouveau en entamer une quand vous le souhaiterez.{" "}
        </p>
        <Button
          linkProps={{
            href: "/candidat",
          }}
          priority="secondary"
        >
          Revenir à l'accueil
        </Button>
      </div>
      <Image
        src="/candidat/images/error-hexagon.svg"
        alt="Candidature supprimée"
        width={282}
        height={319}
      />
    </PageLayout>
  );
}
