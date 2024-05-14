"use client";
import { useAuth } from "@/components/auth/auth";
import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAgencyManagerPage } from "./agencyManagerPage.hook";

const managerFormSchema = z.object({
  accountFirstname: z
    .string()
    .min(2, "Ce champ doit contenir au moins 2 caractères")
    .default(""),
  accountLastname: z
    .string()
    .min(2, "Ce champ doit contenir au moins 2 caractères")
    .default(""),
  accountEmail: z
    .string()
    .email("Le champ doit contenir une adresse email")
    .default(""),
});

type ManagerFormData = z.infer<typeof managerFormSchema>;

const AgencyManagerPage = () => {
  const { account, organismQueryStatus, updateAgencyManagerAccount } =
    useAgencyManagerPage();
  const { organismId } = useParams<{ organismId: string }>();

  const { isGestionnaireMaisonMereAAP } = useAuth();

  const {
    reset,
    register,
    formState: { isSubmitting },
    handleSubmit,
  } = useForm<ManagerFormData>({
    resolver: zodResolver(managerFormSchema),
    defaultValues: {},
  });

  const handleReset = useCallback(() => {
    reset({
      accountEmail: account?.email,
      accountFirstname: account?.firstname || "",
      accountLastname: account?.lastname || "",
    });
  }, [account?.email, account?.firstname, account?.lastname, reset]);

  useEffect(() => {
    handleReset();
  }, [handleReset]);

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await updateAgencyManagerAccount.mutateAsync({
        organismId,
        ...data,
      });
      successToast("modifications enregistrées");
    } catch (e) {
      graphqlErrorToast(e);
    }
  });

  return (
    <div className="flex flex-col pb-12 w-full">
      <h1>Information du responsable d'agence</h1>

      {organismQueryStatus === "error" && (
        <Alert
          className="mb-6"
          severity="error"
          title="Une erreur est survenue pendant la récupération de l'agence."
        />
      )}

      {organismQueryStatus === "success" && (
        <form
          className="mt-8 flex flex-col gap-4"
          onSubmit={handleFormSubmit}
          onReset={(e) => {
            e.preventDefault();
            handleReset();
          }}
        >
          <fieldset
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            disabled={!isGestionnaireMaisonMereAAP}
          >
            <Input
              label="Prénom"
              nativeInputProps={register("accountFirstname")}
            />
            <Input label="Nom" nativeInputProps={register("accountLastname")} />
            <div className="flex flex-col col-span-2">
              <Input
                label="Email"
                nativeInputProps={register("accountEmail")}
              />
              {isGestionnaireMaisonMereAAP && (
                <SmallNotice>
                  Le responsable d'agence recevra la confirmation pour la
                  validation du compte sur cet email. Il lui sera également
                  nécessaire pour se connecter à la plateforme.
                </SmallNotice>
              )}
            </div>
          </fieldset>
          {isGestionnaireMaisonMereAAP && (
            <div className="flex flex-col md:flex-row gap-4 self-center md:self-end mt-8">
              <Button priority="secondary" type="reset">
                Réinitialiser
              </Button>
              <Button disabled={isSubmitting}>Enregistrer</Button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default AgencyManagerPage;
