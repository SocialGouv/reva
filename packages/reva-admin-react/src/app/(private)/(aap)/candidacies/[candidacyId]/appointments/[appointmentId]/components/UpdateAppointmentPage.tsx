import { createModal } from "@codegouvfr/react-dsfr/Modal/Modal";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import {
  AppointmentDuration,
  AppointmentTemporalStatus,
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
    temporalStatus: AppointmentTemporalStatus;
  };
  candidate: {
    id: string;
    lastname: string;
    firstname: string;
  };
  candidacyId: string;
}) => {
  const { updateAppointment, deleteAppointment } = useUpdateAppointmentPage({
    candidacyId,
    appointmentId: appointment?.id,
  });

  const router = useRouter();

  const modal = createModal({
    id: "confirm-appointment-deletion",
    isOpenedByDefault: false,
  });

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

  const handleAppointmentDeletionConfirmation = async () => {
    try {
      await deleteAppointment.mutate({
        candidacyId,
        appointmentId: appointment.id,
      });
      router.push(
        `/candidacies/${candidacyId}/appointments/${appointment.id}/delete-confirmation?date=${appointment.date}&candidateFirstName=${candidate.firstname}&candidateLastName=${candidate.lastname}`,
      );
    } catch (error) {
      console.error(error);
      graphqlErrorToast(error);
    }
  };

  const showDeleteAppointmentButton =
    appointment.temporalStatus === "UPCOMING" &&
    appointment.type !== "RENDEZ_VOUS_PEDAGOGIQUE";

  return (
    <>
      <modal.Component
        title={<span>Suppression d’un rendez vous</span>}
        className="confirm-appointment-deletion-modal"
        size="large"
        buttons={[
          {
            priority: "secondary",
            children: "Annuler",
          },
          {
            priority: "primary",
            onClick: handleAppointmentDeletionConfirmation,
            children: "Confirmer",
            className: "confirm-appointment-deletion-modal-button",
          },
        ]}
      >
        <div className="flex flex-col gap-4">
          <p className="mb-2">
            Supprimer un rendez-vous est irréversible, la description et les
            détails seront supprimés.
          </p>
          <p className="mb-2">Le candidat en sera notifié par courriel.</p>
          <p>Confirmez-vous la suppression de ce rendez vous ?</p>
        </div>
      </modal.Component>
      <div
        className="flex flex-col w-full"
        data-testid="update-appointments-page"
      >
        <h1 data-testid="update-appointments-page-title">{title}</h1>
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
          onDeleteButtonClick={
            showDeleteAppointmentButton ? modal.open : undefined
          }
        />
      </div>
    </>
  );
};
