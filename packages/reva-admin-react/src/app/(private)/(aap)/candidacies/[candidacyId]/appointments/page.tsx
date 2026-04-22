"use client";
import { useParams } from "next/navigation";

import { AddAppointmentButton } from "./_components/AddAppointmentButton";
import { AddFirstAppointmentCard } from "./_components/AddFirstAppointmentCard";
import { PastAppointments } from "./_components/PastAppointments";
import { UpcomingAppointments } from "./_components/UpcomingAppointments";
import { useAppointmentsPage } from "./appointmentsPage.hook";

export default function AppointmentsPage() {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { rendezVousPedagogiqueMissing } = useAppointmentsPage({
    candidacyId,
  });

  return (
    <div className="flex flex-col w-full" data-testid="appointments-page">
      <h1>Gestion des rendez-vous</h1>
      <p className="text-xl mb-12">
        Renseignez tous les rendez-vous avec votre candidat. Commencez par
        renseigner le rendez-vous pédagogique obligatoire afin de pouvoir
        ajouter tous vos rendez-vous de suivi.
      </p>

      <AddAppointmentButton
        addAppointmentButtonDisabled={rendezVousPedagogiqueMissing}
        candidacyId={candidacyId}
        className="ml-auto mb-2"
      />
      {rendezVousPedagogiqueMissing && (
        <AddFirstAppointmentCard candidacyId={candidacyId} />
      )}
      <UpcomingAppointments candidacyId={candidacyId} />
      <PastAppointments candidacyId={candidacyId} />
    </div>
  );
}
