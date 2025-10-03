"use client";
import { useParams, useRouter } from "next/navigation";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { formatIso8601Time } from "@/utils/formatIso8601Time";

import {
  AppointmentForm,
  AppointmentFormData,
} from "../_components/AppointmentForm";

import { useUpdateAppointmentPage } from "./updateAppointmentPage.hook";

export default function UpdateAppointmentPage() {
  const { candidacyId, appointmentId } = useParams<{
    candidacyId: string;
    appointmentId: string;
  }>();
  const router = useRouter();

  const { candidate, appointment, updateAppointment } =
    useUpdateAppointmentPage({
      candidacyId,
      appointmentId,
    });

  if (!appointment) {
    return null;
  }

  let title = "";
  let description = "";

  switch (appointment?.type) {
    case "RENDEZ_VOUS_PEDAGOGIQUE":
      title = `Rendez-vous pédagogique de ${candidate?.lastname} ${candidate?.firstname}`;
      description =
        "Le rendez-vous pédagogique est le début des interactions avec le candidat. Son enregistrement est obligatoire. Vous ne pouvez donc pas le supprimer mais vous pouvez le modifier tant que vous le souhaitez. Les modifications seront visibles du candidat.";
      break;
    case "RENDEZ_VOUS_DE_SUIVI":
      title = `Rendez-vous de suivi de ${candidate?.lastname} ${candidate?.firstname}`;
      description =
        "Les rendez-vous de suivi peuvent être modifiés et supprimés en tout temps. Les modifications seront visibles du candidat.";
      break;
  }

  const handleSubmit = async (data: AppointmentFormData) => {
    try {
      await updateAppointment.mutateAsync({
        candidacyId,
        appointmentId: appointment?.id,
        ...data,
        time: data.time ? data.time + ":00.000Z" : null,
        duration: data.duration || null,
      });
      successToast("Rendez-vous enregistré");
      router.push(`/candidacies/${candidacyId}/appointments`);
    } catch (error) {
      console.error(error);
      graphqlErrorToast(error);
    }
  };

  return (
    <div className="flex flex-col w-full" data-test="update-appointments-page">
      <h1>{title}</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl mb-12">{description}</p>
      <AppointmentForm
        backUrl={`/candidacies/${candidacyId}/appointments`}
        onSubmit={handleSubmit}
        defaultValues={{
          ...appointment,
          time: appointment.time ? formatIso8601Time(appointment.time) : null,
        }}
      />
    </div>
  );
}
