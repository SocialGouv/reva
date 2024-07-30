"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { graphql } from "@/graphql/generated";
import { CompetenceDetails } from "@/graphql/generated/graphql";
import { Input } from "@codegouvfr/react-dsfr/Input";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  competences: z
    .object({
      competenceId: z.string(),
      label: z.string(),
      text: z.string().min(1, "Merci de remplir ce champ"),
      state: z.enum(["YES", "NO", "PARTIALLY"], {
        invalid_type_error: "Merci de choisir une option",
      }),
    })
    .array(),
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
          text
        }
        blocsDeCompetences(blocDeCompetencesId: $blocDeCompetencesId) {
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
    dematerialized_feasibility_file_createOrupdateCertificationCompetenceDetails(
      candidacyId: $candidacyId
      input: $input
    ) {
      id
    }
  }
`);

const CompetenciesBlockPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { candidacyId, blocDeCompetencesId } = useParams<{
    candidacyId: string;
    blocDeCompetencesId: string;
  }>();

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
      competenceBlocId: string;
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

  const defaultValues = useMemo(
    () => ({
      competences: competencesFromBlock?.map((c) => ({
        competenceId: c.id,
        label: c.label,
        text: dematerializedFile?.certificationCompetenceDetails.find(
          (ccd) => ccd.certificationCompetence.id === c.id,
        )?.text,
        state: dematerializedFile?.certificationCompetenceDetails.find(
          (ccd) => ccd.certificationCompetence.id === c.id,
        )?.state,
      })),
    }),
    [competencesFromBlock, dematerializedFile?.certificationCompetenceDetails],
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { fields: competencesFields } = useFieldArray({
    control,
    name: "competences",
  });

  const resetForm = useCallback(
    () => reset(defaultValues),
    [defaultValues, reset],
  );

  useEffect(resetForm, [resetForm]);

  const handleFormSubmit = handleSubmit(async (data) => {
    const competenceDetails = data.competences.map((c) => ({
      competenceId: c.competenceId,
      text: c.text,
      state: c.state,
    }));
    try {
      await createOrUpdateCompetenceDetails.mutateAsync({
        dematerializedFeasibilityFileId: dematerializedFile?.id || "",
        competenceBlocId: blocDeCompetencesId,
        competenceDetails,
      });
      successToast("Modifications enregistrées");
    } catch (e) {
      graphqlErrorToast(e);
    }
  });

  return (
    <div className="flex flex-col">
      <h1>Blocs de compétences</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="text-xl">
        Détailler l’activité et le niveau d’autonomie et/ou de responsabilité du
        candidat, et donner des exemples d’outils, méthodes, supports utilisés
      </p>
      {block && (
        <>
          <h2 className="mb-0">{block.code}</h2>
          <p className="text-lg font-medium">{block.label}</p>
          <form
            onSubmit={handleFormSubmit}
            onReset={(e) => {
              e.preventDefault();
              resetForm();
            }}
          >
            {competencesFields?.map((c, i) => (
              <>
                <Input
                  key={c.id}
                  textArea
                  label={c.label}
                  classes={{ nativeInputOrTextArea: "!min-h-[88px]" }}
                  nativeTextAreaProps={{
                    ...register(`competences.${i}.text`),
                  }}
                  stateRelatedMessage={errors?.competences?.[i]?.text?.message}
                  state={errors?.competences?.[i]?.text ? "error" : "default"}
                />
                <RadioButtons
                  stateRelatedMessage={errors?.competences?.[i]?.state?.message}
                  state={errors?.competences?.[i]?.state ? "error" : "default"}
                  orientation="horizontal"
                  options={[
                    {
                      label: "Oui",
                      nativeInputProps: {
                        ...register(`competences.${i}.state`),
                        value: "YES",
                      },
                    },
                    {
                      label: "Non",
                      nativeInputProps: {
                        ...register(`competences.${i}.state`),
                        value: "NO",
                      },
                    },
                    {
                      label: "Partiellement",
                      nativeInputProps: {
                        ...register(`competences.${i}.state`),
                        value: "PARTIALLY",
                      },
                    },
                  ]}
                />
              </>
            ))}
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
