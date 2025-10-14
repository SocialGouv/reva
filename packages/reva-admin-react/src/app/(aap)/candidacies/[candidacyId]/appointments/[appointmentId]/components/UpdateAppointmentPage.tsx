import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import {
  AppointmentDuration,
  AppointmentType,
} from "@/graphql/generated/graphql";

import {
  AppointmentForm,
  AppointmentFormData,
} from "../../_components/AppointmentForm";

import { useUpdateAppointmentPage } from "./updateAppointmentPage.hooks";

export const UpdateAppointmentPage = ({
  appointment,
  candidate,
  candidacyId,
}: {
  appointment: {
    id: string;
    type: AppointmentType;
    title: string;
    date: string;
    description?: string | null;
    duration?: AppointmentDuration | null;
    location?: string | null;
  };
  candidate: {
    id: string;
    lastname: string;
    firstname: string;
  };
  candidacyId: string;
}) => {
  const { updateAppointment } = useUpdateAppointmentPage({
    candidacyId,
    appointmentId: appointment?.id,
  });

  const router = useRouter();

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
    const dateTime = new Date(data.date + "T" + data.time);

    try {
      await updateAppointment.mutateAsync({
        candidacyId,
        appointmentId: appointment?.id,
        duration: data.duration || null,
        location: data.location || null,
        description: data.description || null,
        date: dateTime,
        title: data.title,
      });
      successToast("Rendez-vous enregistré");
      router.push(
        `/candidacies/${candidacyId}/appointments/${appointment.id}/update-confirmation`,
      );
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
          date: format(new Date(appointment.date), "yyyy-MM-dd"),
          time: format(new Date(appointment.date), "HH:mm"),
        }}
      />
    </div>
  );
};
