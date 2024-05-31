import { FormOptionalFieldsDisclaimer } from "@/components/form/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { useProfessionalSpaceSubscriptionContext } from "@/components/professional-space/inscription/context/ProfessionalSpaceSubscriptionContext";
import { graphql } from "@/graphql/generated";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { CompanyPreview } from "../component/CompanyPreview";

const zodSchema = z.object({
  companySiret: z.string().length(14, "doit comporter 14 chiffres"),
  companyLegalStatus: z.string().min(1, "obligatoire"),
  companyName: z.string().min(1, "obligatoire"),
  companyWebsite: z.union([z.literal(""), z.string().url()]),
  managerFirstname: z.string().min(1, "obligatoire"),
  managerLastname: z.string().min(1, "obligatoire"),
});

type CompanySiretStepFormSchema = z.infer<typeof zodSchema>;

export const CompanySiretStepForm = () => {
  const {
    goBackToPreviousStep,
    submitCompanySiretStep,
    professionalSpaceInfos,
  } = useProfessionalSpaceSubscriptionContext();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<CompanySiretStepFormSchema>({
    resolver: zodResolver(zodSchema),
    defaultValues: { ...professionalSpaceInfos },
  });

  const companySiret = watch("companySiret");

  const { etablissement, isLoading, isFetching } =
    useEtablissement(companySiret);

  const isSiretLengthValid =
    companySiret != undefined && companySiret?.length >= 14;

  console.log("etablissement", etablissement);

  const handleFormSubmit = (data: CompanySiretStepFormSchema) => {
    console.log(data);

    // submitCompanySiretStep({
    //   companySiret: "12345678901234",
    //   companyName: "My Company",
    //   companyLegalStatus: "SAS",
    //   companyWebsite: "https://example.com",
    //   managerFirstname: "John",
    //   managerLastname: "Doe",
    // })
  };

  return (
    <>
      <h1 className="mb-12">
        Étape 1 : Vérification du numéro SIRET
        <FormOptionalFieldsDisclaimer />
      </h1>
      <Stepper
        title="Insérez votre numéro SIRET ainsi que les nom et prénom(s) du ou de la dirigean(e)."
        currentStep={1}
        stepCount={3}
      />

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Numéro SIRET du siège social"
            hintText="14 chiffres"
            state={errors.companySiret ? "error" : "default"}
            stateRelatedMessage={errors.companySiret?.message}
            nativeInputProps={{ ...register("companySiret") }}
          />

          <Input
            label="Site internet"
            hintText="(Optionnel)"
            state={errors.companyWebsite ? "error" : "default"}
            stateRelatedMessage={errors.companyWebsite?.message}
            nativeInputProps={{ ...register("companyWebsite") }}
          />
        </div>

        {isSiretLengthValid && !isLoading && !isFetching && (
          <CompanyPreview siret={companySiret} etablissment={etablissement} />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nom du (de la) dirigeant(e)"
            state={errors.managerFirstname ? "error" : "default"}
            stateRelatedMessage={errors.managerFirstname?.message}
            nativeInputProps={{ ...register("managerFirstname") }}
          />

          <Input
            label="Prénom(s) du (de la) dirigeant(e)"
            state={errors.managerLastname ? "error" : "default"}
            stateRelatedMessage={errors.managerLastname?.message}
            nativeInputProps={{ ...register("managerLastname") }}
          />
        </div>

        <div className="flex gap-2 mt-4 justify-between">
          <Button
            type="button"
            priority="secondary"
            onClick={goBackToPreviousStep}
          >
            Retour
          </Button>
          <Button type="submit">Passer à l'étape 2</Button>
        </div>
      </form>
    </>
  );
};

const getEtablissementQuery = graphql(`
  query getEtablissement($siret: ID!) {
    getEtablissement(siret: $siret) {
      siret
      siege_social
      raison_sociale
      forme_juridique
      date_fermeture
      qualiopi_status
    }
  }
`);

const useEtablissement = (siret?: string) => {
  const { graphqlClient } = useGraphQlClient();

  const { isLoading, isError, data, error, isFetching } = useQuery({
    queryKey: ["siret"],
    queryFn: () =>
      graphqlClient.request(getEtablissementQuery, { siret: siret! }),
    enabled: siret != undefined && siret?.length >= 14,
  });

  return {
    etablissement: data?.getEtablissement,
    isLoading,
    isError,
    error,
    isFetching,
  };
};
