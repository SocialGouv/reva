"use client";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { AppointmentType } from "@/graphql/generated/graphql";

import {
  AppointmentForm,
  AppointmentFormData,
} from "../_components/AppointmentForm";

import { useAddAppointmentPage } from "./addAppointmentPage.hook";

const sendEmailToCandidateModal = createModal({
  id: "send-email-to-candidate-modal",
  isOpenedByDefault: true,
});

export default function AddAppointmentPage() {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const router = useRouter();
  const [formData, setFormData] = useState<AppointmentFormData | null>();

  const { candidate, createAppointment } = useAddAppointmentPage({
    candidacyId,
  });

  let title,
    description,
    formTitle = "";

  switch (type) {
    case "RENDEZ_VOUS_PEDAGOGIQUE":
      title = `Rendez-vous pédagogique de ${candidate?.lastname} ${candidate?.firstname}`;
      description =
        "Le rendez-vous pédagogique est le début des interactions avec le candidat. Son enregistrement est obligatoire. Vous ne pouvez donc pas le supprimer mais vous pouvez le modifier tant que vous le souhaitez. Les modifications seront visibles du candidat.";
      formTitle = "Rendez-vous pédagogique";
      break;
    case "RENDEZ_VOUS_DE_SUIVI":
      title = `Rendez-vous de suivi de ${candidate?.lastname} ${candidate?.firstname}`;
      description =
        "Les rendez-vous de suivi peuvent être modifiés et supprimés en tout temps. Les modifications seront visibles du candidat.";
      formTitle = "Rendez-vous de suivi";
      break;
  }

  const handleSubmit = async (data: AppointmentFormData) => {
    setFormData(data);
    sendEmailToCandidateModal.open();
  };

  const handleSendEmailToCandidateModalButtonClick = async (
    sendEmailToCandidate: boolean,
  ) => {
    const data = formData;
    if (!data) {
      toast.error("no form data");
      console.error("no form data");
      return;
    }
    try {
      await createAppointment.mutateAsync({
        candidacyId,
        type: type as AppointmentType,
        ...data,
        time: data.time ? data.time + ":00.000Z" : null,
        duration: data.duration || null,
        sendEmailToCandidate,
      });
      successToast("Rendez-vous enregistré");
      router.push(`/candidacies/${candidacyId}/appointments`);
    } catch (error) {
      console.error(error);
      graphqlErrorToast(error);
    }
  };

  return (
    <div className="flex flex-col w-full" data-test="add-appointments-page">
      <h1>{title}</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl mb-12">{description}</p>
      <AppointmentForm
        defaultValues={{
          title: formTitle,
        }}
        backUrl={`/candidacies/${candidacyId}/appointments`}
        onSubmit={handleSubmit}
      />
      <sendEmailToCandidateModal.Component
        size="large"
        title="Souhaitez-vous envoyer un mail de notification au candidat ?"
        buttons={[
          {
            priority: "secondary",
            children: "Ne pas envoyer",
            onClick: () => handleSendEmailToCandidateModalButtonClick(false),
          },
          {
            children: "Envoyer",
            onClick: () => handleSendEmailToCandidateModalButtonClick(true),
            id: "send-email-to-candidate-modal-button",
          },
        ]}
      >
        <p>
          Le candidat recevra un mail l’invitant à consulter les détails de ce
          rendez vous depuis son espace.
        </p>
      </sendEmailToCandidateModal.Component>
    </div>
  );
}
