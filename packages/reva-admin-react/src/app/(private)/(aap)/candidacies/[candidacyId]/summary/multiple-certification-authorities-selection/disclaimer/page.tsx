"use client";
import Image from "next/image";
import { useParams } from "next/navigation";

import { StatusPage } from "@/components/status-page/StatusPage";

export default function MultipleCertificationAuthoritiesSelectionDisclaimerPage() {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  return (
    <StatusPage
      title="Certificateur"
      chapo="Le certificateur étudiera les dossiers de faisabilité et de validation de cette candidature."
      details="Plusieurs certificateurs sont disponibles pour la certification sélectionnée et la localisation du candidat. Vous devez sélectionner le certificateur le plus adapté en accord avec le candidat."
      pictogram={
        <Image
          src="/admin2/components/student.svg"
          alt="Toque d'étudiant"
          width={160}
          height={180}
        />
      }
      actionLink={{
        href: `/candidacies/${candidacyId}/summary/multiple-certification-authorities-selection/certification-authorities-list`,
        label: "Liste des certificateurs",
        priority: "primary",
      }}
      extraLink={{
        href: `/candidacies/${candidacyId}/summary`,
        label: "Retour",
        priority: "secondary",
      }}
    />
  );
}
