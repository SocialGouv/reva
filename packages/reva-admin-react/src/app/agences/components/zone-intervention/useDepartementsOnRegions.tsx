import { useAgencesQueries } from "@/app/agences/agenceQueries";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

interface Departement {
  departementId: string;
  departementLabel: string;
  isSelected: boolean;
  code: string;
}

interface Region {
  regionId: string;
  regionLabel: string;
  isSelected: boolean;
  departements: Departement[];
}

export type ZoneInterventionList = Region[];

export function useDepartementsOnRegions() {
  const { maisonMereAAPOnDepartements } = useAgencesQueries();
  const { watch, setValue } = useFormContext();
  const zoneInterventionPresentiel = watch("zoneInterventionPresentiel");
  const zoneInterventionDistanciel = watch("zoneInterventionDistanciel");

  /**
   * This useEffect is used to initialize the zoneInterventionPresentiel and zoneInterventionDistanciel
   * with the data from maisonMereAAPOnDepartements
   * if the data is not already initialized
   * if the data is already initialized, we do nothing
   * maisonMereAAPOnDepartements is a list of departements with the information if the departement is
   * estADistance or estSurPlace
   * zoneInterventionPresentiel and zoneInterventionDistanciel are the two lists of departements
   * that are used to display the departements in the UI
   * zoneInterventionPresentiel is the list of departements that are estSurPlace
   * zoneInterventionDistanciel is the list of departements that are estADistance
   **/
  useEffect(() => {
    if (
      !zoneInterventionPresentiel?.length ||
      !zoneInterventionDistanciel?.length
    ) {
      const maisonMereAAPOnDepartementsOnRegionsRemote: Record<string, Region> =
        {};

      const maisonMereAAPOnDepartementsOnRegionsOnSite: Record<string, Region> =
        {};

      maisonMereAAPOnDepartements?.forEach(
        ({ departement, estADistance, estSurPlace }) => {
          const regionId = departement.region.id;

          if (estADistance) {
            if (!maisonMereAAPOnDepartementsOnRegionsRemote[regionId]) {
              maisonMereAAPOnDepartementsOnRegionsRemote[regionId] = {
                regionId: departement.region.id,
                regionLabel: departement.region.label,
                isSelected: false,
                departements: [
                  {
                    departementLabel: departement.label,
                    departementId: departement.id,
                    isSelected: false,
                    code: departement.code,
                  },
                ],
              };
            } else {
              maisonMereAAPOnDepartementsOnRegionsRemote[
                regionId
              ].departements.push({
                departementLabel: departement.label,
                departementId: departement.id,
                isSelected: false,
                code: departement.code,
              });
            }
          }

          if (estSurPlace) {
            if (!maisonMereAAPOnDepartementsOnRegionsOnSite[regionId]) {
              maisonMereAAPOnDepartementsOnRegionsOnSite[regionId] = {
                regionId: departement.region.id,
                regionLabel: departement.region.label,
                isSelected: false,
                departements: [
                  {
                    departementLabel: departement.label,
                    departementId: departement.id,
                    isSelected: false,
                    code: departement.code,
                  },
                ],
              };
            } else {
              maisonMereAAPOnDepartementsOnRegionsOnSite[
                regionId
              ].departements.push({
                departementLabel: departement.label,
                departementId: departement.id,
                isSelected: false,
                code: departement.code,
              });
            }
          }
        },
      );

      setValue(
        "zoneInterventionDistanciel",
        Object.values(maisonMereAAPOnDepartementsOnRegionsRemote).sort((a, b) =>
          a.regionLabel.localeCompare(b.regionLabel),
        ),
      );
      setValue(
        "zoneInterventionPresentiel",
        Object.values(maisonMereAAPOnDepartementsOnRegionsOnSite).sort((a, b) =>
          a.regionLabel.localeCompare(b.regionLabel),
        ),
      );
    }
  }, [
    maisonMereAAPOnDepartements,
    setValue,
    zoneInterventionDistanciel?.length,
    zoneInterventionPresentiel?.length,
  ]);
}
