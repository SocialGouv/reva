"use client";
import Button from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Panel } from "@/components/layout/Panel";

export default function CandidacyDeletedPage() {
  const router = useRouter();

  return (
    <Panel>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-6">Votre candidature a été supprimée</h2>
          <p className="text-xl mb-10">
            Suite à votre demande, nous avons supprimé votre candidature. Si
            vous souhaitez en déposer une nouvelle, vous pouvez le faire depuis
            votre espace.
          </p>
          <Button onClick={() => router.push("../../")} priority="secondary">
            Revenir à l'accueil
          </Button>
        </div>
        <Image
          src="/candidat/images/error-hexagon.svg"
          alt="Candidature supprimée"
          width={282}
          height={319}
        />
      </div>
    </Panel>
  );
}
