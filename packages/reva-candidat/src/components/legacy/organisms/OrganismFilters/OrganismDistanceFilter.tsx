import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import { useEffect } from "react";

interface OrganismDistanceFilterProps {
  onChangeSearchZip: (zip: string) => void;
  onChangeSearchPmr: (pmr: boolean) => void;
  disabled: boolean;
  zip: string;
  setZip: (zip: string) => void;
  pmr: boolean;
  setPmr: (pmr: boolean) => void;
}

export const OrganismDistanceFilter = ({
  onChangeSearchZip,
  onChangeSearchPmr,
  disabled,
  zip,
  setZip,
  pmr,
  setPmr,
}: OrganismDistanceFilterProps) => {
  useEffect(() => {
    if (zip.length === 0 || zip.length === 5) {
      onChangeSearchZip(zip);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zip]);

  const handleChangePmr = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeSearchPmr(e.target.checked);
    setPmr(e.target.checked);
  };

  return (
    <div className="flex flex-col gap-6 mt-6">
      <fieldset>
        <legend className={`mb-2 ${disabled ? "text-gray-400" : ""}`}>
          Où souhaitez-vous réaliser votre accompagnement ?
        </legend>
        <Input
          label=""
          disabled={disabled}
          nativeInputProps={{
            placeholder: "Indiquez un code postal",
            onChange: (e) => {
              // Ensure the input contains only digits and is at most 5 characters long for the zip code
              if (!/^\d{0,5}$/.test(e.target.value)) {
                return;
              }
              setZip(e.target.value);
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
                disabled,
                onChange: handleChangePmr,
                checked: pmr,
              },
            },
          ]}
        />
      </fieldset>
    </div>
  );
};
