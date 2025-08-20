"use client";
import Input from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormButtons } from "@/components/form/form-footer/FormButtons";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

const structureVaeCollectiveSchema = z.object({
  raisonSociale: z.string().min(1, "Merci de remplir ce champ"),
  gestionnaireEmail: z.string().min(1, "Merci de remplir ce champ"),
  gestionnaireFirstname: z.string().min(1, "Merci de remplir ce champ"),
  gestionnaireLastname: z.string().min(1, "Merci de remplir ce champ"),
});

type StructureVaeCollectiveFormValues = z.infer<
  typeof structureVaeCollectiveSchema
>;

export default function AddStructureVaeCollectivePage() {
  const router = useRouter();
  const { register, handleSubmit, formState, reset } =
    useForm<StructureVaeCollectiveFormValues>({
      resolver: zodResolver(structureVaeCollectiveSchema),
      defaultValues: {
        raisonSociale: "",
        gestionnaireEmail: "",
        gestionnaireFirstname: "",
        gestionnaireLastname: "",
      },
    });

  const onSubmit = async (data: StructureVaeCollectiveFormValues) => {
    try {
      console.log({ data });
      successToast("Structure de VAE collective créée avec succès");
      router.push(`/structures-vae-collective`);
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <h1>Nouvelle structure de VAE collective</h1>

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
          backUrl="/structures-vae-collective"
          formState={{
            isDirty: formState.isDirty,
            isSubmitting: formState.isSubmitting,
          }}
        />
      </form>
    </div>
  );
}
