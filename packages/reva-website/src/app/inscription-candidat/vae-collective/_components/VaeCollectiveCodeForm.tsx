"use client";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getVaeCollectiveCohortQuery = graphql(`
  query getVaeCollectiveCohort($codeInscription: String!) {
    cohorteVaeCollective(codeInscription: $codeInscription) {
      id
      codeInscription
    }
  }
`);

const zodSchema = z.object({
  code: z
    .string()
    .length(8, "Le code doit contenir exactement 8 caractères")
    .regex(
      /^[A-Za-z0-9]+$/,
      "Le code ne doit contenir que des lettres et des chiffres",
    ),
});

type FormData = z.infer<typeof zodSchema>;

export function VaeCollectiveCodeForm() {
  const router = useRouter();
  const { graphqlClient } = useGraphQlClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    setError,
    clearErrors,
  } = useForm<FormData>({
    resolver: zodResolver(zodSchema),
    defaultValues: {
      code: "",
    },
    reValidateMode: "onSubmit",
  });

  const codeValue = watch("code");
  const isFormComplete = codeValue.length === 8;

  const { refetch: validateCode, isLoading } = useQuery({
    queryKey: ["validateVaeCollectiveCode", codeValue],
    queryFn: () =>
      graphqlClient.request(getVaeCollectiveCohortQuery, {
        codeInscription: codeValue,
      }),
    enabled: false,
  });

  const handleFormSubmit = handleSubmit(async () => {
    const result = await validateCode();
    if (result.data?.cohorteVaeCollective) {
      router.push(`/inscription-candidat/vae-collective/${codeValue}`);
    } else {
      setError("code", {
        message:
          "Le code ne correspond à aucune VAE collective engagée sur France VAE",
      });
    }
  });

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-8">
      <Input
        label=""
        classes={{
          nativeInputOrTextArea:
            "w-[270px] uppercase text-center text-xl tracking-[18px] font-normal py-8 pr-0",
        }}
        hintText="8 caractères alphanumériques"
        state={errors.code ? "error" : "default"}
        stateRelatedMessage={errors.code?.message}
        nativeInputProps={{
          ...register("code", {
            onChange: () => clearErrors("code"),
          }),
          maxLength: 8,
          autoComplete: "off",
          spellCheck: false,
        }}
      />
      <div className="flex justify-between gap-4 flex-wrap">
        <Button
          priority="secondary"
          onClick={() => router.push("/commencer")}
          type="button"
        >
          Retour
        </Button>
        <Button
          priority="primary"
          type="submit"
          disabled={!isDirty || !isFormComplete || isLoading}
        >
          Valider et m'inscrire
        </Button>
      </div>
    </form>
  );
}
