"use client";
import { useParams } from "next/navigation";

import { UpdateAppointmentPage } from "./components/UpdateAppointmentPage";
import { ViewAppointmentPage } from "./components/ViewAppointmentPage";
import { useUpdateOrViewAppointmentPage } from "./updateOrViewAppointmentPage.hook";

export default function UpdateOrViewAppointmentPage() {
  const { candidacyId, appointmentId } = useParams<{
    candidacyId: string;
    appointmentId: string;
  }>();

  const { candidate, appointment } = useUpdateOrViewAppointmentPage({
    candidacyId,
    appointmentId,
  });

  if (!appointment || !candidate) {
    return null;
  }

  if (appointment.temporalStatus === "UPCOMING") {
    return (
      <UpdateAppointmentPage
        appointment={appointment}
        candidate={candidate}
        candidacyId={candidacyId}
      />
    );
  } else {
    return <ViewAppointmentPage />;
  }
}
