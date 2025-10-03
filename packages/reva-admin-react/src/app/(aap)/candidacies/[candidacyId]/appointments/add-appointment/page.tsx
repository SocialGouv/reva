"use client";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { AppointmentType } from "@/graphql/generated/graphql";

import {
  AppointmentForm,
  AppointmentFormData,
} from "../_components/AppointmentForm";

import { useAddAppointmentPage } from "./addAppointmentPage.hook";

export default function AddAppointmentPage() {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const router = useRouter();

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
    try {
      await createAppointment.mutateAsync({
        candidacyId,
        type: type as AppointmentType,
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
    </div>
  );
}
