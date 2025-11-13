"use client";
import Button from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useKeycloakContext } from "@/components/auth/keycloak.context";
import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { PageLayout } from "@/layouts/page.layout";

export default function CandidacyDeletedPage() {
  const router = useRouter();

  const { isFeatureActive } = useFeatureFlipping();
  const isMultiCandidacyFeatureActive = isFeatureActive("MULTI_CANDIDACY");

  const { logout } = useKeycloakContext();

  return (
    <PageLayout
      title="Candidature supprimée"
      className="flex items-center justify-between"
    >
      <div>
        <h2 className="mb-6">Votre candidature a été supprimée</h2>
        <p className="text-xl mb-10">
          Suite à votre demande, nous avons supprimé votre candidature. Si vous
          souhaitez en déposer une nouvelle, vous pouvez le faire depuis votre
          espace.
        </p>
        <Button
          onClick={
            isMultiCandidacyFeatureActive ? () => router.push("../../") : logout
          }
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
