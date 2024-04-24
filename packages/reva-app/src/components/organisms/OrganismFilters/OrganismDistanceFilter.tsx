import Input from "@codegouvfr/react-dsfr/Input";
import { useEffect, useState } from "react";

interface OrganismDistanceFilterProps {
  onChangeSearchZipOrCity: (zipOrCity: string) => void;
  disabled: boolean;
}

export const OrganismDistanceFilter = ({
  onChangeSearchZipOrCity,
  disabled,
}: OrganismDistanceFilterProps) => {
  const [zipOrCity, setZipOrCity] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onChangeSearchZipOrCity(zipOrCity);
    }, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zipOrCity]);

  return (
    <div className="flex flex-col gap-6 mt-6">
      <fieldset>
        <legend className={`mb-2 ${disabled ? "text-gray-400" : ""}`}>
          Indiquez une ville ou un code postal
        </legend>
        <Input
          label=""
          disabled={disabled}
          nativeInputProps={{
            placeholder: "Angers",
            onChange: (e) => setZipOrCity(e.target.value),
            value: zipOrCity,
          }}
        />
      </fieldset>
    </div>
  );
};
