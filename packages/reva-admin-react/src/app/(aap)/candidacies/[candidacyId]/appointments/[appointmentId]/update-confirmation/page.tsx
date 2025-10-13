"use client";
import Button from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";
import { useParams } from "next/navigation";

import { formatIso8601Date } from "@/utils/formatIso8601Date";
import { formatIso8601Time } from "@/utils/formatIso8601Time";

import { useAppointmentUpdateConfirmationPage } from "./appointmentUpdateConfirmationPage.hooks";
import appointmentPolygon from "./assets/appointment-polygon.svg";

export default function AppointmentUpdateConfirmationPage() {
  const { candidacyId, appointmentId } = useParams<{
    candidacyId: string;
    appointmentId: string;
  }>();

  const { candidate, appointment } = useAppointmentUpdateConfirmationPage({
    candidacyId,
    appointmentId,
  });

  if (!appointment) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center md:flex-col-reverse">
      <div className="flex flex-col md:items-center">
        <h1 data-test="appointment-update-confirmation-page-title">
          Rendez-vous enregistré
        </h1>
        <p className="text-xl mb-2">
          Le {formatIso8601Date(appointment.date)} à{" "}
          {formatIso8601Time(appointment.date)}
        </p>
        <p className="text-xl mb-6">
          Candidat : {candidate?.lastname} {candidate?.firstname}
        </p>
        <p className="text-sm mb-10">
          Le candidat aura accès aux détails du rendez vous depuis son espace.
        </p>
        <Button
          data-test="appointment-update-confirmation-page-go-back-to-appointments-button"
          className="w-full flex justify-center md:justify-start md:w-auto"
          linkProps={{ href: `/candidacies/${candidacyId}/appointments` }}
        >
          Gestion des rendez-vous
        </Button>
      </div>
      <Image src={appointmentPolygon} alt="icône rendez-vous" />
    </div>
  );
}
