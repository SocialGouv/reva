"use client";
import Input from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { sanitizedText } from "@/utils/input-sanitization";

import { graphql } from "@/graphql/generated";
import {
  CertificationCompetenceBlocInput,
  CompetenceDetails,
} from "@/graphql/generated/graphql";

const schema = z.object({
  competences: z
    .object({
      competenceId: z.string(),
      label: z.string(),
      state: z.enum(["YES", "NO", "PARTIALLY"], {
        invalid_type_error: "Merci de choisir une option",
      }),
    })
    .array(),
  blocText: sanitizedText(),
});

type FormData = z.infer<typeof schema>;

const getBlocDeCompetencesQuery = graphql(`
  query getBlocDeCompetencesForCompetenciesBlockPage(
    $candidacyId: ID!
    $blocDeCompetencesId: ID!
  ) {
    feasibility_getActiveFeasibilityByCandidacyId(candidacyId: $candidacyId) {
      dematerializedFeasibilityFile {
        id
        certificationCompetenceDetails {
          state
          certificationCompetence {
            id
          }
        }
        blocsDeCompetences(blocDeCompetencesId: $blocDeCompetencesId) {
          text
          certificationCompetenceBloc {
            id
            code
            label
            competences {
              id
              label
            }
          }
        }
      }
    }
  }
`);

const createOrUpdateCompetenceDetailsMutation = graphql(`
  mutation createOrUpdateCompetenceDetailsMutation(
    $input: DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput!
    $candidacyId: ID!
  ) {
    dematerialized_feasibility_file_createOrUpdateCertificationCompetenceDetails(
      candidacyId: $candidacyId
      input: $input
    ) {
      id
    }
  }
`);

const CompetenciesBlockPage = () => {
  const { candidacyId, blocDeCompetencesId } = useParams<{
    candidacyId: string;
    blocDeCompetencesId: string;
  }>();
  const { graphqlClient } = useGraphQlClient();
  const router = useRouter();
  const feasibilitySummaryUrl = `/candidacies/${candidacyId}/feasibility-aap`;

  const { data: getBlocDeCompetencesResponse } = useQuery({
    queryKey: [candidacyId, "getBlocDeCompetencesForCompetenciesBlockPage"],
    queryFn: () =>
      graphqlClient.request(getBlocDeCompetencesQuery, {
        candidacyId,
        blocDeCompetencesId,
      }),
  });

  const createOrUpdateCompetenceDetails = useMutation({
    mutationFn: (input: {
      dematerializedFeasibilityFileId: string;
      competenceBloc: CertificationCompetenceBlocInput;
      competenceDetails: CompetenceDetails[];
    }) =>
      graphqlClient.request(createOrUpdateCompetenceDetailsMutation, {
        candidacyId,
        input,
      }),
  });

  const dematerializedFile =
    getBlocDeCompetencesResponse?.feasibility_getActiveFeasibilityByCandidacyId
      ?.dematerializedFeasibilityFile;

  const block =
    dematerializedFile?.blocsDeCompetences?.[0]?.certificationCompetenceBloc;

  const competencesFromBlock = block?.competences;
  const blockText = dematerializedFile?.blocsDeCompetences?.[0]?.text;

  const defaultValues = useMemo(
    () => ({
      competences: competencesFromBlock?.map((c) => ({
        competenceId: c.id,
        label: c.label,
        state: dematerializedFile?.certificationCompetenceDetails.find(
          (ccd) => ccd.certificationCompetence.id === c.id,
        )?.state,
      })),
      blocText: blockText || "",
    }),
    [
      competencesFromBlock,
      dematerializedFile?.certificationCompetenceDetails,
      blockText,
    ],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const competencesFields = watch("competences");

  const resetForm = useCallback(
    () => reset(defaultValues),
    [defaultValues, reset],
  );

  useEffect(resetForm, [resetForm]);

  const handleFormSubmit = handleSubmit(async (data) => {
    const competenceDetails = data.competences.map((c) => ({
      competenceId: c.competenceId,
      state: c.state,
    }));
    try {
      await createOrUpdateCompetenceDetails.mutateAsync({
        dematerializedFeasibilityFileId: dematerializedFile?.id || "",
        competenceBloc: {
          id: blocDeCompetencesId,
          text: data.blocText,
        },
        competenceDetails,
      });
      successToast("Modifications enregistrées");
      router.push(feasibilitySummaryUrl);
    } catch (e) {
      graphqlErrorToast(e);
    }
  });

  return (
    <div className="flex flex-col">
      <h1>Blocs de compétences</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl">
        Faites le lien entre les activités déclarées par le candidat et chaque
        bloc de compétences. Apportez un maximum de contexte sur l’activité via
        la section “Commentaire”.
      </p>
      {block && (
        <>
          <h2 className="mb-0">{block.code}</h2>
          <p className="text-xl font-bold mb-8">{block.label}</p>
          <form
            onSubmit={handleFormSubmit}
            onReset={(e) => {
              e.preventDefault();
              resetForm();
            }}
          >
            {competencesFields?.map((c, i) => (
              <div key={c.competenceId}>
                <p className="text-lg font-medium">{c.label}</p>
                <RadioButtons
                  stateRelatedMessage={errors?.competences?.[i]?.state?.message}
                  state={errors?.competences?.[i]?.state ? "error" : "default"}
                  orientation="horizontal"
                  options={[
                    {
                      label: "Oui",
                      nativeInputProps: {
                        value: "YES",
                        checked: c.state == "YES",
                        ...register(`competences.${i}.state`),
                      },
                    },
                    {
                      label: "Non",
                      nativeInputProps: {
                        value: "NO",
                        checked: c.state == "NO",
                        ...register(`competences.${i}.state`),
                      },
                    },
                    {
                      label: "Partiellement",
                      nativeInputProps: {
                        value: "PARTIALLY",
                        checked: c.state == "PARTIALLY",
                        ...register(`competences.${i}.state`),
                      },
                    },
                  ]}
                />
              </div>
            ))}
            <Input
              textArea
              label="Commentaire sur le bloc"
              nativeTextAreaProps={{
                ...register("blocText"),
              }}
              stateRelatedMessage={errors?.blocText?.message}
              state={errors?.blocText ? "error" : "default"}
              data-test="block-comment-input"
            />
            <FormButtons
              backUrl={`/candidacies/${candidacyId}/feasibility-aap`}
              formState={{
                isDirty,
                isSubmitting,
              }}
            />
          </form>
        </>
      )}
    </div>
  );
};

export default CompetenciesBlockPage;
