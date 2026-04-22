"use client";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";

import { EndAccompagnementForm } from "./_components/EndAccompagnementForm";
import { EndAccompagnementReadOnly } from "./_components/EndAccompagnementReadOnly";
import { useEndAccompagnement } from "./end-accompagnement.hook";

export default function EndAccompagnementPage() {
  const { candidacy } = useEndAccompagnement();

  const endAccompagnementNotRequested =
    candidacy?.endAccompagnementStatus === "NOT_REQUESTED";

  return (
    <div>
      <h1>Fin d'accompagnement</h1>
      <FormOptionalFieldsDisclaimer />
      <p className="mb-12 text-xl">
        Le candidat aura toujours accès à son espace pour finaliser sa
        candidature de façon autonome.
      </p>
      {endAccompagnementNotRequested ? (
        <EndAccompagnementForm />
      ) : (
        <EndAccompagnementReadOnly />
      )}
    </div>
  );
}
