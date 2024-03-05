"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";

import { zodResolver } from "@hookform/resolvers/zod";

import { errorToast, successToast } from "@/components/toast/toast";

import { useAccountForm } from "./AccountForm.hook";

const schema = z.object({
  firstname: z.string().default(""),
  lastname: z.string().default(""),
  email: z
    .string()
    .email("Le champ doit contenir une adresse email valide")
    .default(""),
});

type FormData = z.infer<typeof schema>;

interface Props {
  account: {
    id: string;
    firstname?: string | null;
    lastname?: string | null;
    email: string;
  };
}

const AccountForm = (props: Props) => {
  const { account } = props;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstname: account.firstname || "",
      lastname: account.lastname || "",
      email: account.email,
    },
  });

  const { updateAccount } = useAccountForm();

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await updateAccount.mutateAsync({
        accountId: account.id,
        accountData: data,
      });

      successToast("Le compte a bien été mis à jour");
    } catch (error) {
      const errorMessage =
        (error as any)?.response?.errors?.[0]?.message ||
        '"Une erreur est survenue"';

      errorToast(errorMessage);
    }
  });

  return (
    <div>
      <h2 className="text-l font-bold my-4">Informations compte utilisateur</h2>

      <form className="flex flex-col gap-8" onSubmit={handleFormSubmit}>
        <fieldset className="flex flex-row justify-between">
          <Input
            className="flex-1"
            label="PRÉNOM"
            nativeInputProps={{ ...register("firstname") }}
          />

          <div className="w-4" />

          <Input
            className="flex-1"
            label="NOM"
            nativeInputProps={{ ...register("lastname") }}
          />

          <div className="w-4" />

          <Input
            className="flex-1"
            label="EMAIL"
            state={errors.email ? "error" : "default"}
            stateRelatedMessage={errors.email?.message}
            nativeInputProps={{ ...register("email") }}
          />
        </fieldset>

        <div className="flex flex-row justify-end">
          <Button disabled={isSubmitting}>Enregistrer</Button>
        </div>
      </form>
    </div>
  );
};

export default AccountForm;
