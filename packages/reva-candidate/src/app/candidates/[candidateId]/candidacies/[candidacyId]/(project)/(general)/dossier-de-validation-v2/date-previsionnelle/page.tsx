"use client";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import Input from "@codegouvfr/react-dsfr/Input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";

import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { Panel } from "@/components/layout/Panel";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { graphql } from "@/graphql/generated";

import { DatePrevisionnelleResourcesSection } from "./_components/DatePrevisionnelleResourcesSection";

const getCandidacyByIdForDatePrevisionnellePage = graphql(`
  query getCandidacyByIdForDatePrevisionnellePage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      readyForJuryEstimatedAt
    }
  }
`);

const updateReadyForJuryEstimatedAtMutation = graphql(`
  mutation updateReadyForJuryEstimatedAtForDossierDeValidationPage(
    $candidacyId: UUID!
    $readyForJuryEstimatedAt: Date!
  ) {
    candidacy_setReadyForJuryEstimatedAt(
      candidacyId: $candidacyId
      readyForJuryEstimatedAt: $readyForJuryEstimatedAt
    ) {
      id
      readyForJuryEstimatedAt
    }
  }
`);

export default function DatePrevisionnellePage() {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data, isLoading } = useQuery({
    queryKey: ["getCandidacyByIdForDatePrevisionnellePage", candidacyId],
    queryFn: () =>
      graphqlClient.request(getCandidacyByIdForDatePrevisionnellePage, {
        candidacyId,
      }),
  });
  const [isDirty, setIsDirty] = useState(false);

  const [readyForJuryEstimatedAt, setReadyForJuryEstimatedAt] = useState(
    data?.getCandidacyById?.readyForJuryEstimatedAt,
  );

  const updateReadyForJuryEstimatedAt = useMutation({
    mutationFn: (data: { readyForJuryEstimatedAt: string }) =>
      graphqlClient.request(updateReadyForJuryEstimatedAtMutation, {
        readyForJuryEstimatedAt: data.readyForJuryEstimatedAt,
        candidacyId,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["candidate"] }),
  });

  const handleReadyForJuryEstimatedDateFormSubmit = async ({
    readyForJuryEstimatedAt,
  }: {
    readyForJuryEstimatedAt: string;
  }) => {
    try {
      await updateReadyForJuryEstimatedAt.mutateAsync({
        readyForJuryEstimatedAt,
      });
      successToast("La date prévisionnelle a été enregistrée");
      setIsDirty(false);
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  if (isLoading) {
    return <div>Chargement de la candidature...</div>;
  }

  return (
    <Panel>
      <div className="flex flex-col">
        <Breadcrumb
          currentPageLabel="Date prévisionnelle de dépot du dossier de validation"
          className="mb-4"
          segments={[
            {
              label: "Ma candidature",
              linkProps: {
                href: "../../",
              },
            },
            {
              label: "Dossier de validation",
              linkProps: {
                href: "../",
              },
            },
          ]}
        />
        <h1>Date prévisionnelle de dépôt du dossier de validation</h1>
        <p className="text-lg">
          Cette date est donnée à titre estimatif, elle est non engageante.
        </p>
        <form
          className="flex gap-6 flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            if (readyForJuryEstimatedAt) {
              handleReadyForJuryEstimatedDateFormSubmit({
                readyForJuryEstimatedAt,
              });
            }
          }}
        >
          <div className="flex flex-row gap-6">
            <div className="flex flex-col gap-6 basis-9/12">
              <Input
                label="Date prévisionelle (optionnelle)"
                data-testid="ready-for-jury-estimated-date-input"
                className="w-[282px] mb-0"
                nativeInputProps={{
                  type: "date",
                  min: new Date().toISOString().split("T")[0],
                  max: "2100-01-01",
                  defaultValue:
                    data?.getCandidacyById?.readyForJuryEstimatedAt ||
                    undefined,
                  onChange: (e) => {
                    setReadyForJuryEstimatedAt(e.target.value);
                    if (
                      data?.getCandidacyById?.readyForJuryEstimatedAt ===
                      e.target.value
                    ) {
                      setIsDirty(false);
                    } else {
                      setIsDirty(true);
                    }
                  },
                }}
              />
              <CallOut title="">
                Cette date est une estimation et permet au certificateur
                d'anticiper l'organisation du passage devant le jury.
              </CallOut>
            </div>
            <div className="basis-3/12">
              <DatePrevisionnelleResourcesSection />
            </div>
          </div>
          <FormButtons
            formState={{
              isSubmitting: updateReadyForJuryEstimatedAt.isPending,
              isDirty,
            }}
            className="self-start justify-between w-full"
            backUrl="../"
            hideResetButton
          />
        </form>
      </div>
    </Panel>
  );
}
