"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { createCohort } from "./actions";
import { useActionState } from "react";

export default function NouvelleCohortePage() {
  const [state, action, pending] = useActionState(createCohort, {});

  return (
    <div className="flex flex-col w-full">
      <h1 className="mb-12">Nouvelle cohorte</h1>
      <form action={action} className="flex flex-col">
        <Input
          label="Nom de la cohorte"
          nativeInputProps={{
            name: "name",
          }}
          state={state.errors?.name ? "error" : "default"}
          stateRelatedMessage={state.errors?.name?.message}
        />
        <div className="flex justify-between mt-6">
          <Button linkProps={{ href: "../" }}>Annuler</Button>
          <Button disabled={pending}>Créer</Button>
        </div>
      </form>
    </div>
  );
}
