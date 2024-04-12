"use client";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { graphql } from "@/graphql/generated";
import { CompetenceIdAndText } from "@/graphql/generated/graphql";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo, useCallback, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  competences: z
    .object({ competenceId: z.string(), label: z.string(), text: z.string() })
    .array(),
});

type FormData = z.infer<typeof schema>;

const getBlocDeCompetencesQuery = graphql(`
  query getBlocDeCompetencesForCompetenciesBlockPage(
    $candidacyId: ID!
    $blocDeCompetencesId: ID!
  ) {
    getCandidacyById(id: $candidacyId) {
      dematerializedFeasibilityFile {
        id
        certificationCompetenceDetails {
          certificationCompetence {
            id
          }
          text
        }
        blocsDeCompetences(blocDeCompetencesId: $blocDeCompetencesId) {
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
`);

const createOrUpdateCompetenceDetailsMutation = graphql(`
  mutation createOrUpdateCompetenceDetailsMutaion(
    $input: DematerializedFeasibilityFileCreateOrUpdateCertificationCompetenceDetailsInput!
  ) {
    dematerialized_feasibility_file_createOrupdateCertificationCompetenceDetails(
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
      candidacyId: string;
      dematerializedFeasibilityFileId: string;
      competenceBlocId: string;
      competenceIdAndTexts: CompetenceIdAndText[];
    }) =>
      graphqlClient.request(createOrUpdateCompetenceDetailsMutation, {
        input,
      }),
  });

  const dematerializedFile =
    getBlocDeCompetencesResponse?.getCandidacyById
      ?.dematerializedFeasibilityFile;

  const block = dematerializedFile?.blocsDeCompetences?.[0];

  const competencesFromBlock = block?.competences;

  const defaultValues = useMemo(
    () => ({
      competences: competencesFromBlock?.map((c) => ({
        competenceId: c.id,
        label: c.label,
        text: dematerializedFile?.certificationCompetenceDetails.find(
          (ccd) => ccd.certificationCompetence.id === c.id,
        )?.text,
      })),
    }),
    [competencesFromBlock, dematerializedFile?.certificationCompetenceDetails],
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting, isDirty },
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
    try {
      await createOrUpdateCompetenceDetails.mutateAsync({
        candidacyId,
        dematerializedFeasibilityFileId: dematerializedFile?.id || "",
        competenceBlocId: blocDeCompetencesId,
        competenceIdAndTexts: data.competences.map((c) => ({
          competenceId: c.competenceId,
          text: c.text,
        })),
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
              <Input
                key={c.id}
                textArea
                label={c.label}
                classes={{ nativeInputOrTextArea: "!min-h-[88px]" }}
                nativeTextAreaProps={{
                  ...register(`competences.${i}.text`),
                }}
              />
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
