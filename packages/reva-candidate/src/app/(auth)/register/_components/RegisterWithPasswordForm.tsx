"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { graphqlErrorToast } from "@/components/toast/toast";

import { useRegister } from "../register.hooks";

export const RegisterWithPasswordForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const { askForRegistration } = useRegister();

  const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await askForRegistration.mutateAsync({
        email,
      });
      if (response) {
        router.push("/register-confirmation");
      }
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <Input
        className="mb-0"
        disabled={askForRegistration.isPending}
        hintText="Format attendu : nom@domaine.fr"
        nativeInputProps={{
          id: "email",
          name: "email",
          required: true,
          type: "email",
          autoComplete: "email",
          spellCheck: "false",
          onChange: (e) => setEmail(e.target.value),
        }}
        label="Identifiant"
      />

      <Button
        type="submit"
        className="w-full justify-center"
        disabled={askForRegistration.isPending}
      >
        S'inscrire
      </Button>
    </form>
  );
};
