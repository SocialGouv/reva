"use client";
import { CandidacyBackButton } from "@/components/candidacy-back-button/CandidacyBackButton";
import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { successToast, graphqlErrorToast } from "@/components/toast/toast";
import { graphql } from "@/graphql/generated";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { useCallback, useEffect } from "react";

const schema = z
  .object({
    admissibilityStatus: z.enum(["alreadyAdmissible", "notAlreadyAdmissible"], {
      errorMap: (issue, ctx) => {
        return { message: "Ce champ est obligatoire" };
      },
    }),
    expiresAt: z.string().optional(),
  })
  .refine(
    (data) =>
      data.admissibilityStatus === "notAlreadyAdmissible" ||
      data.expiresAt !== "",
    {
      message: "Ce champ est obligatoire",
      path: ["expiresAt"],
    },
  );

type FormData = z.infer<typeof schema>;

const getCandidacyQuery = graphql(`
  query getCandidacyForAdmissibility($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      admissibilityFvae {
        isAlreadyAdmissible
        expiresAt
      }
    }
  }
`);

const updateCandidacyAdmissibilityMutation = graphql(`
  mutation updateCandidacyAdmissibilityMutation(
    $candidacyId: UUID!
    $admissibility: AdmissibilityInputFvae!
  ) {
    candidacy_updateAdmissibilityFvae(
      candidacyId: $candidacyId
      admissibility: $admissibility
    ) {
      expiresAt
      isAlreadyAdmissible
    }
  }
`);

const AdmissibilityPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const router = useRouter();

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = methods;

  const admissibilityStatus = watch(
    "admissibilityStatus",
    "notAlreadyAdmissible",
  );
  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidacyResponse, status: getCandidacyStatus } = useQuery({
    queryKey: ["getCandidacy", candidacyId, "admissibilityFvae"],
    queryFn: () =>
      graphqlClient.request(getCandidacyQuery, {
        candidacyId,
      }),
  });

  const updateCandidacyFirstAppointmentInformations = useMutation({
    mutationFn: ({
      candidacyId,
      admissibility: { isAlreadyAdmissible, expiresAt },
    }: {
      candidacyId: string;
      admissibility: {
        isAlreadyAdmissible: boolean;
        expiresAt: Date | null;
      };
    }) =>
      graphqlClient.request(updateCandidacyAdmissibilityMutation, {
        candidacyId,
        admissibility: {
          isAlreadyAdmissible,
          expiresAt:
            isAlreadyAdmissible && expiresAt ? expiresAt.getTime() : null,
        },
      }),
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await updateCandidacyFirstAppointmentInformations.mutateAsync({
        candidacyId,
        admissibility: {
          isAlreadyAdmissible: data.admissibilityStatus === "alreadyAdmissible",
          expiresAt: data.expiresAt
            ? parse(data.expiresAt, "yyyy-MM-dd", new Date())
            : null,
        },
      });
      successToast("Les modifications ont bien été enregistrées");
      router.push(`/candidacies/${candidacyId}/summary`);
    } catch (e) {
      graphqlErrorToast(e);
    }
  });

  const isAlreadyAdmissible =
    getCandidacyResponse?.getCandidacyById?.admissibilityFvae
      ?.isAlreadyAdmissible;

  const expiresAt =
    getCandidacyResponse?.getCandidacyById?.admissibilityFvae?.expiresAt;

  const admissibilityFvaeResponse =
    getCandidacyResponse?.getCandidacyById?.admissibilityFvae;

  const resetForm = useCallback(() => {
    reset({
      admissibilityStatus: !admissibilityFvaeResponse
        ? undefined
        : isAlreadyAdmissible
          ? "alreadyAdmissible"
          : "notAlreadyAdmissible",
      expiresAt: expiresAt ? format(expiresAt, "yyyy-MM-dd") : undefined,
    });
  }, [reset, expiresAt, isAlreadyAdmissible, admissibilityFvaeResponse]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  return (
    <div className="flex flex-col">
      <CandidacyBackButton candidacyId={candidacyId} />
      <h1>Compléter la recevabilité </h1>
      <FormOptionalFieldsDisclaimer />
      {getCandidacyStatus === "success" && (
        <form onSubmit={handleFormSubmit} className="flex flex-col mt-8">
          <RadioButtons
            legend="Le candidat a-t-il déjà obtenu une recevabilité favorable pour cette certification ?"
            options={[
              {
                label: "Oui",
                nativeInputProps: {
                  ...register("admissibilityStatus"),
                  value: "alreadyAdmissible",
                },
              },
              {
                label: "Non",
                nativeInputProps: {
                  ...register("admissibilityStatus"),
                  value: "notAlreadyAdmissible",
                },
              },
            ]}
            state={errors.admissibilityStatus ? "error" : "default"}
            stateRelatedMessage={errors.admissibilityStatus?.message}
          />
          {admissibilityStatus === "alreadyAdmissible" && (
            <Input
              className="max-w-xs mt-4"
              label="Date de fin de validité "
              hintText="Date au format 31/12/2022"
              nativeInputProps={{
                type: "date",
                ...register("expiresAt"),
              }}
              state={errors.expiresAt ? "error" : "default"}
              stateRelatedMessage={errors.expiresAt?.message}
            />
          )}
          <div className="flex gap-4 items-center justify-end mt-10">
            <Button
              priority="secondary"
              linkProps={{ href: `/candidacies/${candidacyId}/summary` }}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Enregistrer
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdmissibilityPage;
