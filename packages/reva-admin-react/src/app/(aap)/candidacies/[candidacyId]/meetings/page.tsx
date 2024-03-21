"use client";
import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { SmallWarning } from "@/components/small-warning/SmallWarning";
import { successToast, graphqlErrorToast } from "@/components/toast/toast";
import { graphql } from "@/graphql/generated";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import { useParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  firstAppointmentOccuredAt: z.string().min(1, "Ce champ est obligatoire"),
});

type FormData = z.infer<typeof schema>;

const getCandidacyQuery = graphql(`
  query getCandidacyForMeetingsPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      firstAppointmentOccuredAt
    }
  }
`);

const updateCandidacyFirstAppointmentInformationsMutation = graphql(`
  mutation updateCandidacyFirstAppointmentInformationsMutation(
    $candidacyId: ID!
    $appointmentInformations: AppointmentInformationsInput!
  ) {
    candidacy_updateAppointmentInformations(
      candidacyId: $candidacyId
      appointmentInformations: $appointmentInformations
    ) {
      id
    }
  }
`);

const MeetingsPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = methods;

  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidacyResponse, status: getCandidacyStatus } = useQuery({
    queryKey: ["getCandidacy", candidacyId],
    queryFn: () =>
      graphqlClient.request(getCandidacyQuery, {
        candidacyId,
      }),
  });

  const updateCandidacyFirstAppointmentInformations = useMutation({
    mutationFn: ({
      candidacyId,
      firstAppointmentOccuredAt,
    }: {
      candidacyId: string;
      firstAppointmentOccuredAt: Date;
    }) =>
      graphqlClient.request(
        updateCandidacyFirstAppointmentInformationsMutation,
        {
          candidacyId,
          appointmentInformations: {
            firstAppointmentOccuredAt: firstAppointmentOccuredAt.getTime(),
          },
        },
      ),
  });

  const firstAppointmentOccuredAt =
    getCandidacyResponse?.getCandidacyById?.firstAppointmentOccuredAt;

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await updateCandidacyFirstAppointmentInformations.mutateAsync({
        candidacyId,
        firstAppointmentOccuredAt: parse(
          data.firstAppointmentOccuredAt,
          "yyyy-MM-dd",
          new Date(),
        ),
      });
      successToast("Les modifications ont bien été enregistrées");
    } catch (e) {
      graphqlErrorToast(e);
    }
  });

  const resetForm = useCallback(() => {
    reset({
      firstAppointmentOccuredAt: firstAppointmentOccuredAt
        ? format(firstAppointmentOccuredAt, "yyyy-MM-dd")
        : undefined,
    });
  }, [reset, firstAppointmentOccuredAt]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  return (
    <div className="flex flex-col">
      <CandidacyBackButton candidacyId={candidacyId} />
      <h1>Rendez-vous pédagogique</h1>
      <FormOptionalFieldsDisclaimer />
      {getCandidacyStatus === "success" && (
        <form
          onSubmit={handleFormSubmit}
          onReset={(e) => {
            e.preventDefault();
            resetForm();
          }}
          className="flex flex-col mt-8"
        >
          <Input
            className="max-w-xs"
            label="Date du premier rendez-vous pédagogique"
            hintText="Date au format 31/12/2022"
            nativeInputProps={{
              type: "date",
              ...register("firstAppointmentOccuredAt"),
            }}
            state={errors.firstAppointmentOccuredAt ? "error" : "default"}
            stateRelatedMessage={errors.firstAppointmentOccuredAt?.message}
          />

          {isValid ? (
            <SmallNotice>
              Le candidat pourra modifier sa candidature jusqu'à cette date,
              au-delà de laquelle toute modification sera bloquée.
            </SmallNotice>
          ) : (
            <SmallWarning>
              Cette information est obligatoire pour continuer le parcours. Le
              candidat pourra modifier sa candidature jusqu'à cette date,
              au-delà de laquelle toute modification sera bloquée.
            </SmallWarning>
          )}
          <div className="flex flex-col md:flex-row gap-4 items-center self-center md:self-end mt-10">
            <Button disabled={isSubmitting}>Enregistrer</Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default MeetingsPage;
