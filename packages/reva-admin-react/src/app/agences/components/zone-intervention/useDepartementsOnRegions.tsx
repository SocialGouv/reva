import { useAgencesQueries } from "@/app/agences/agencesQueries";
import { sortDepartmentsByAlphabeticalOrderAndDOM } from "@/app/agences/utils/sortDepartmentsByAlphabeticalOrderAndDOM";
import { Organism } from "@/graphql/generated/graphql";
import { useEffect, useRef } from "react";

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

interface UseDepartementsOnRegionsProps {
  zoneInterventionPresentiel: ZoneInterventionList;
  zoneInterventionDistanciel: ZoneInterventionList;
  setValue: (name: any, value: any) => void;
  agenceSelected?: Partial<Organism>;
}

export function useDepartementsOnRegions({
  zoneInterventionPresentiel,
  zoneInterventionDistanciel,
  setValue,
  agenceSelected,
}: UseDepartementsOnRegionsProps) {
  const { maisonMereAAPOnDepartements } = useAgencesQueries();

  let organismOndepartementsOnRegionsOnSite = useRef<Region[]>([]);
  let organismOndepartementsOnRegionsRemote = useRef<Region[]>([]);

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
      const departementsOnRegionsRemote: Record<string, Region> = {};
      const departementsOnRegionsOnSite: Record<string, Region> = {};
      const organismOnDepartments = agenceSelected?.organismOnDepartments;

      maisonMereAAPOnDepartements?.forEach(
        ({ departement, estADistance, estSurPlace }) => {
          const regionId = departement.region.id;
          const departementSelected = organismOnDepartments?.find(
            (organismOnDepartment) =>
              organismOnDepartment.departmentId === departement.id,
          );

          if (estADistance) {
            if (!departementsOnRegionsRemote[regionId]) {
              departementsOnRegionsRemote[regionId] = {
                regionId: departement.region.id,
                regionLabel: departement.region.label,
                isSelected: departementSelected?.isRemote ?? false,
                departements: [
                  {
                    departementLabel: departement.label,
                    departementId: departement.id,
                    isSelected: departementSelected?.isRemote ?? false,
                    code: departement.code,
                  },
                ],
              };
            } else {
              const regionIsSelected = departementsOnRegionsRemote[
                regionId
              ].departements.every((departement) => departement.isSelected);

              departementsOnRegionsRemote[regionId].isSelected =
                (regionIsSelected && departementSelected?.isRemote) || false;
              departementsOnRegionsRemote[regionId].departements.push({
                departementLabel: departement.label,
                departementId: departement.id,
                isSelected: departementSelected?.isRemote ?? false,
                code: departement.code,
              });
            }
          }

          if (estSurPlace) {
            if (!departementsOnRegionsOnSite[regionId]) {
              departementsOnRegionsOnSite[regionId] = {
                regionId: departement.region.id,
                regionLabel: departement.region.label,
                isSelected: departementSelected?.isOnSite ?? false,
                departements: [
                  {
                    departementLabel: departement.label,
                    departementId: departement.id,
                    isSelected: departementSelected?.isOnSite ?? false,
                    code: departement.code,
                  },
                ],
              };
            } else {
              const regionIsSelected = departementsOnRegionsOnSite[
                regionId
              ].departements.every((departement) => departement.isSelected);

              departementsOnRegionsOnSite[regionId].isSelected =
                (regionIsSelected && departementSelected?.isOnSite) || false;

              departementsOnRegionsOnSite[regionId].departements.push({
                departementLabel: departement.label,
                departementId: departement.id,
                isSelected: departementSelected?.isOnSite ?? false,
                code: departement.code,
              });
            }
          }
        },
      );

      organismOndepartementsOnRegionsOnSite.current =
        sortDepartmentsByAlphabeticalOrderAndDOM(
          Object.values(departementsOnRegionsRemote),
        );

      organismOndepartementsOnRegionsRemote.current =
        sortDepartmentsByAlphabeticalOrderAndDOM(
          Object.values(departementsOnRegionsOnSite),
        );

      setValue(
        "zoneInterventionDistanciel",
        organismOndepartementsOnRegionsOnSite.current,
      );
      setValue(
        "zoneInterventionPresentiel",
        organismOndepartementsOnRegionsRemote.current,
      );
    }
  }, [
    maisonMereAAPOnDepartements,
    setValue,
    zoneInterventionDistanciel?.length,
    zoneInterventionPresentiel?.length,
    agenceSelected,
  ]);

  return {
    organismOndepartementsOnRegionsOnSite:
      organismOndepartementsOnRegionsOnSite.current,
    organismOndepartementsOnRegionsRemote:
      organismOndepartementsOnRegionsRemote.current,
  };
}
