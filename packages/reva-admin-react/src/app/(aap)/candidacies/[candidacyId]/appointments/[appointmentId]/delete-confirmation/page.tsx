"use client";
import Button from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";

import { formatIso8601Date } from "@/utils/formatIso8601Date";
import { formatIso8601Time } from "@/utils/formatIso8601Time";

import appointmentDeletedPolygon from "./assets/appointment-deleted-polygon.svg";

export default function AppointmentDeleteConfirmationPage() {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const candidateFirstName = searchParams.get("candidateFirstName");
  const candidateLastName = searchParams.get("candidateLastName");

  if (!date || !candidateFirstName || !candidateLastName) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center md:flex-col-reverse">
      <div className="flex flex-col md:items-center">
        <h1 data-test="appointment-delete-confirmation-page-title">
          Rendez-vous supprimé
        </h1>
        <p
          className="text-xl mb-2"
          data-test="appointment-delete-confirmation-page-date"
        >
          Le {formatIso8601Date(date)} à {formatIso8601Time(date)}
        </p>
        <p
          className="text-xl mb-6"
          data-test="appointment-delete-confirmation-page-candidate"
        >
          Candidat : {candidateLastName} {candidateFirstName}
        </p>

        <Button
          data-test="appointment-update-confirmation-page-go-back-to-appointments-button"
          className="w-full flex justify-center md:justify-start md:w-auto"
          linkProps={{ href: `/candidacies/${candidacyId}/appointments` }}
        >
          Gestion des rendez-vous
        </Button>
      </div>
      <Image src={appointmentDeletedPolygon} alt="icône rendez-vous" />
    </div>
  );
}
