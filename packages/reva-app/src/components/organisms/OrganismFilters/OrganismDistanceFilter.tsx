import Input from "@codegouvfr/react-dsfr/Input";
import { Range } from "@codegouvfr/react-dsfr/Range";
import { useState } from "react";

export const OrganismDistanceFilter = () => {
  const [kmSelected, setKmSelected] = useState("25");
  return (
    <div className="flex flex-col gap-6 mt-6">
      <fieldset>
        <legend className="mb-2">Indiquez une ville ou un code postal</legend>
        <Input
          label=""
          nativeInputProps={{
            placeholder: "Angers",
          }}
        />
      </fieldset>
      <fieldset>
        <Range
          label="Dans un rayon de"
          max={100}
          min={0}
          suffix=" km"
          nativeInputProps={{
            value: kmSelected,
            onChange: (e) => setKmSelected(e.target.value),
          }}
        />
      </fieldset>
    </div>
  );
};
