"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { useState } from "react";

export const ReadyForJuryEstimatedDateTab = ({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: { readyForJuryEstimatedAt?: string };
  onSubmit?: (data: { readyForJuryEstimatedAt: string }) => void;
}) => {
  const [readyForJuryEstimatedAt, setReadyForJuryEstimatedAt] = useState(
    defaultValues?.readyForJuryEstimatedAt,
  );

  return (
    <div className="flex flex-col">
      <p>
        La date prévisionnelle est une simple estimation. Il s’agit de la date à
        laquelle vous pensez avoir finalisé votre dossier de validation.
        Rassurez-vous, si vous ne la respectez pas, ce n’est pas compromettant
        pour votre parcours ! Cela permet simplement au certificateur de prévoir
        une date de passage devant les jurys.
      </p>
      <form
        className="flex gap-6 items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (readyForJuryEstimatedAt) {
            onSubmit?.({
              readyForJuryEstimatedAt,
            });
          }
        }}
      >
        <Input
          label="Date prévisionelle"
          data-test="ready-for-jury-estimated-date-input"
          className="w-[282px] mb-0"
          nativeInputProps={{
            type: "date",
            min: new Date().toISOString().split("T")[0],
            max: "2100-01-01",
            defaultValue: defaultValues?.readyForJuryEstimatedAt,
            onChange: (e) => {
              setReadyForJuryEstimatedAt(e.target.value);
            },
          }}
        />
        <Button
          nativeButtonProps={{
            disabled: !readyForJuryEstimatedAt?.match(/^\d{4}-\d{2}-\d{2}$/),
          }}
          data-test="submit-ready-for-jury-estimated-date-form-button"
        >
          Valider
        </Button>
      </form>
    </div>
  );
};
