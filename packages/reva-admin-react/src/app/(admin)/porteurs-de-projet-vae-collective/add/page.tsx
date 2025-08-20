"use client";
import Input from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { graphql } from "@/graphql/generated";

const createCommanditaireVaeCollectiveMutation = graphql(`
  mutation vaeCollective_createCommanditaireVaeCollective(
    $raisonSociale: String!
    $gestionnaireEmail: String!
    $gestionnaireFirstname: String!
    $gestionnaireLastname: String!
  ) {
    vaeCollective_createCommanditaireVaeCollective(
      raisonSociale: $raisonSociale
      gestionnaireEmail: $gestionnaireEmail
      gestionnaireFirstname: $gestionnaireFirstname
      gestionnaireLastname: $gestionnaireLastname
    ) {
      id
    }
  }
`);

const porteurDeProjetVaeCollectiveSchema = z.object({
  raisonSociale: z.string().min(1, "Merci de remplir ce champ"),
  gestionnaireEmail: z.string().min(1, "Merci de remplir ce champ"),
  gestionnaireFirstname: z.string().min(1, "Merci de remplir ce champ"),
  gestionnaireLastname: z.string().min(1, "Merci de remplir ce champ"),
});

type PorteurDeProjetVaeCollectiveFormValues = z.infer<
  typeof porteurDeProjetVaeCollectiveSchema
>;

export default function AddPorteurDeProjetVaeCollectivePage() {
  const router = useRouter();
  const { graphqlClient } = useGraphQlClient();
  const { mutateAsync: createCommanditaireVaeCollective } = useMutation({
    mutationFn: (params: {
      raisonSociale: string;
      gestionnaireEmail: string;
      gestionnaireFirstname: string;
      gestionnaireLastname: string;
    }) =>
      graphqlClient.request(createCommanditaireVaeCollectiveMutation, params),
  });

  const { register, handleSubmit, formState, reset } =
    useForm<PorteurDeProjetVaeCollectiveFormValues>({
      resolver: zodResolver(porteurDeProjetVaeCollectiveSchema),
      defaultValues: {
        raisonSociale: "",
        gestionnaireEmail: "",
        gestionnaireFirstname: "",
        gestionnaireLastname: "",
      },
    });

  const onSubmit = async (data: PorteurDeProjetVaeCollectiveFormValues) => {
    try {
      await createCommanditaireVaeCollective(data);
      successToast("Porteur de projet VAE collective créée avec succès");
      router.push(`/porteurs-de-projet-vae-collective`);
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <h1>Nouveau porteur de projet VAE collective</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        onReset={(e) => {
          e.preventDefault();
          reset();
        }}
      >
        <Input
          label="Raison sociale"
          nativeInputProps={register("raisonSociale")}
          state={formState.errors.raisonSociale ? "error" : "default"}
          stateRelatedMessage={formState.errors.raisonSociale?.message}
        />

        <Input
          label="Prénom du gestionnaire"
          nativeInputProps={register("gestionnaireFirstname")}
          state={formState.errors.gestionnaireFirstname ? "error" : "default"}
          stateRelatedMessage={formState.errors.gestionnaireFirstname?.message}
        />
        <Input
          label="Nom du gestionnaire"
          nativeInputProps={register("gestionnaireLastname")}
          state={formState.errors.gestionnaireLastname ? "error" : "default"}
          stateRelatedMessage={formState.errors.gestionnaireLastname?.message}
        />
        <Input
          label="Email du gestionnaire"
          nativeInputProps={{
            ...register("gestionnaireEmail"),
            type: "email",
            spellCheck: "false",
          }}
          state={formState.errors.gestionnaireEmail ? "error" : "default"}
          stateRelatedMessage={formState.errors.gestionnaireEmail?.message}
        />
        <FormButtons
          backUrl="/porteurs-de-projet-vae-collective"
          formState={{
            isDirty: formState.isDirty,
            isSubmitting: formState.isSubmitting,
          }}
        />
      </form>
    </div>
  );
}
