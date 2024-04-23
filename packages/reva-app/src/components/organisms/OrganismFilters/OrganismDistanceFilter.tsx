import Input from "@codegouvfr/react-dsfr/Input";
import { Range } from "@codegouvfr/react-dsfr/Range";
import { useEffect, useState } from "react";

interface OrganismDistanceFilterProps {
  onChangeSearchDistance: (distance: number) => void;
  onChangeSearchZipOrCity: (zipOrCity: string) => void;
}

export const OrganismDistanceFilter = ({
  onChangeSearchDistance,
  onChangeSearchZipOrCity,
}: OrganismDistanceFilterProps) => {
  const [zipOrCity, setZipOrCity] = useState("");
  const [distance, setDistance] = useState("0");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onChangeSearchZipOrCity(zipOrCity);
    }, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zipOrCity]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onChangeSearchDistance(Number(distance));
    }, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distance]);

  return (
    <div className="flex flex-col gap-6 mt-6">
      <fieldset>
        <legend className="mb-2">Indiquez une ville ou un code postal</legend>
        <Input
          label=""
          nativeInputProps={{
            placeholder: "Angers",
            onChange: (e) => setZipOrCity(e.target.value),
            value: zipOrCity,
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
            onChange: (e) => {
              setDistance(e.target.value);
            },
            value: distance,
          }}
        />
      </fieldset>
    </div>
  );
};
