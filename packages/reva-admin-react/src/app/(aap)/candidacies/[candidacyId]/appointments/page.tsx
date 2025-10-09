"use client";
import { useParams } from "next/navigation";

import { AddAppointmentButton } from "./_components/AddAppointmentButton";
import { AddFirstAppointmentCard } from "./_components/AddFirstAppointmentCard";
import { AppointmentCard } from "./_components/AppointmentCard";
import { PastAppointments } from "./_components/PastAppointments";
import { useAppointmentsPage } from "./appointmentsPage.hook";

export default function AppointmentsPage() {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { upcomingAppointments, rendezVousPedagogiqueMissing } =
    useAppointmentsPage({
      candidacyId,
    });

  if (!upcomingAppointments) {
    return null;
  }

  return (
    <div className="flex flex-col w-full" data-test="appointments-page">
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
      {!!upcomingAppointments.info.totalRows && (
        <ul
          className="pl-0 flex flex-col gap-4"
          data-test="upcoming-appointments-list"
        >
          {upcomingAppointments?.rows?.map((appointment) => (
            <li key={appointment.id}>
              <AppointmentCard
                appointment={appointment}
                candidacyId={candidacyId}
              />
            </li>
          ))}
        </ul>
      )}
      {!upcomingAppointments.info.totalRows && <p>Aucun rendez-vous à venir</p>}
      <PastAppointments candidacyId={candidacyId} />
    </div>
  );
}
