"use client";

import Image from "next/image";
import { useParams } from "next/navigation";

import { StatusPage } from "@/app/_components/status-page/StatusPage";

export default function MultipleCertificationAuthoritiesSelectionDisclaimerPage() {
  const { candidateId, candidacyId } = useParams<{
    candidateId: string;
    candidacyId: string;
  }>();

  return (
    <StatusPage
      title="Certificateur"
      chapo="Le certificateur étudiera les dossiers de faisabilité et de validation de cette candidature."
      details="Plusieurs certificateurs sont disponibles pour la certification sélectionnée et votre localisation. Vous devez sélectionner le certificateur le plus adapté."
      pictogram={
        <Image
          src="/candidat/components/student.svg"
          alt="Toque d'étudiant"
          width={160}
          height={180}
        />
      }
      actionLink={{
        href: `/candidates/${candidateId}/candidacies/${candidacyId}/multiple-certification-authorities-selection/certification-authorities-list`,
        label: "Liste des certificateurs",
        priority: "primary",
      }}
      extraLink={{
        href: `/candidates/${candidateId}/candidacies/${candidacyId}`,
        label: "Retour",
        priority: "secondary",
      }}
    />
  );
}
