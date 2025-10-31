import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import { useEffect, useState } from "react";

interface filters {
  organismSearchZip: string;
  organismSearchPmr: boolean;
}

interface OrganismDistanceFilterProps {
  onChangeSearchZip: (zip: string) => void;
  onChangeSearchPmr: (pmr: boolean) => void;
  filters: filters;
  disabled: boolean;
}

export const OrganismDistanceFilter = ({
  onChangeSearchZip,
  onChangeSearchPmr,
  filters,
  disabled,
}: OrganismDistanceFilterProps) => {
  const [zip, setZip] = useState(filters.organismSearchZip);

  useEffect(() => {
    setZip(filters.organismSearchZip);
  }, [filters.organismSearchZip]);

  const handleChangeZip = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZip = e.target.value;
    setZip(newZip);
    if (newZip.length == 0 || newZip.length == 5) {
      onChangeSearchZip(newZip);
    }
  };

  const handleChangePmr = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeSearchPmr(e.target.checked);
  };

  return (
    <div className="flex flex-col gap-6 mt-6">
      <fieldset>
        <legend className={`mb-2 ${disabled ? "text-gray-400" : ""}`}>
          Où souhaitez-vous réaliser votre accompagnement ?
        </legend>
        <Input
          data-testid="input-wrapper-zip"
          label=""
          disabled={disabled}
          nativeInputProps={{
            placeholder: "Indiquez un code postal",
            onChange: (e) => {
              // Ensure the input contains only digits and is at most 5 characters long for the zip code
              if (!/^\d{0,5}$/.test(e.target.value)) {
                return;
              }
              handleChangeZip(e);
            },
            value: zip,
          }}
        />
        <Checkbox
          className="mt-8"
          options={[
            {
              label:
                "Afficher uniquement les sites pouvant recevoir des personnes à mobilité réduite (PMR)",
              nativeInputProps: {
                ...{ "data-testid": "checkbox-wrapper-pmr-input" },
                disabled,
                onChange: handleChangePmr,
                checked: filters.organismSearchPmr,
              },
            },
          ]}
        />
      </fieldset>
    </div>
  );
};
