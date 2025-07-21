"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { getCohorteById, updateNomCohorteVaeCollective } from "./actions";
import { useActionState, useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function UpdateCohortNamePage() {
  const { commanditaireId, cohorteVaeCollectiveId } = useParams<{
    commanditaireId: string;
    cohorteVaeCollectiveId: string;
  }>();

  const [cohorte, setCohorte] = useState<{ id: string; nom: string } | null>(
    null,
  );

  const [state, action, pending] = useActionState(
    updateNomCohorteVaeCollective,
    { name: cohorte?.nom || "" },
  );

  useEffect(() => {
    const fetchCohorte = async () => {
      const cohorte = await getCohorteById(
        commanditaireId,
        cohorteVaeCollectiveId,
      );
      setCohorte(cohorte);
    };

    fetchCohorte();
  }, [cohorteVaeCollectiveId, commanditaireId]);

  return (
    <div className="flex flex-col w-full">
      <h1 className="mb-12">{cohorte?.nom}</h1>
      <form action={action} className="flex flex-col">
        <Input
          data-testid="cohort-name-input"
          label="Nom de la cohorte"
          nativeInputProps={{
            name: "name",
            defaultValue: cohorte?.nom,
          }}
          state={state.errors?.name ? "error" : "default"}
          stateRelatedMessage={state.errors?.name?.message}
        />
        <input type="hidden" name="commanditaireId" value={commanditaireId} />
        <input
          type="hidden"
          name="cohorteVaeCollectiveId"
          value={cohorteVaeCollectiveId}
        />
        <div className="flex justify-between mt-6">
          <Button
            priority="secondary"
            linkProps={{
              href: `/commanditaires/${commanditaireId}/cohortes/${cohorteVaeCollectiveId}`,
            }}
          >
            Annuler
          </Button>
          <Button disabled={pending}>Modifier</Button>
        </div>
      </form>
    </div>
  );
}
