import { useAgencesQueries } from "@/app/(aap)/agences/agencesQueries";
import { Organism } from "@/graphql/generated/graphql";
import { TreeSelectRegion, ZoneInterventionList } from "@/types";
import { sortDepartmentsByAlphabeticalOrderAndDOM } from "@/utils";
import { useEffect, useRef } from "react";

interface UseDepartementsOnRegionsProps {
  zoneInterventionPresentiel: ZoneInterventionList;
  zoneInterventionDistanciel: ZoneInterventionList;
  setValue: (name: any, value: any) => void;
  organism?: Partial<Organism>;
}

export function useDepartementsOnRegions({
  zoneInterventionPresentiel,
  zoneInterventionDistanciel,
  setValue,
  organism,
}: UseDepartementsOnRegionsProps) {
  const { maisonMereAAPOnDepartements } = useAgencesQueries();

  let organismOndepartementsOnRegionsOnSite = useRef<ZoneInterventionList>([]);
  let organismOndepartementsOnRegionsRemote = useRef<ZoneInterventionList>([]);

  /**
   * This useEffect is used to initialize the zoneInterventionPresentiel and zoneInterventionDistanciel
   * with the data from maisonMereAAPOnDepartements
   * if the data is not already initialized
   * if the data is already initialized, we do nothing
   * maisonMereAAPOnDepartements is a list of children with the information if the departement is
   * estADistance or estSurPlace
   * zoneInterventionPresentiel and zoneInterventionDistanciel are the two lists of children
   * that are used to display the children in the UI
   * zoneInterventionPresentiel is the list of children that are estSurPlace
   * zoneInterventionDistanciel is the list of children that are estADistance
   **/
  useEffect(() => {
    if (
      !zoneInterventionPresentiel?.length ||
      !zoneInterventionDistanciel?.length
    ) {
      const departementsOnRegionsRemote: Record<string, TreeSelectRegion> = {};
      const departementsOnRegionsOnSite: Record<string, TreeSelectRegion> = {};
      const organismOnDepartments = organism?.organismOnDepartments;

      maisonMereAAPOnDepartements?.forEach(
        ({ departement, estADistance, estSurPlace }) => {
          const id = departement.region.id;
          const departementSelected = organismOnDepartments?.find(
            (organismOnDepartment) =>
              organismOnDepartment.departmentId === departement.id,
          );

          if (estADistance) {
            if (!departementsOnRegionsRemote[id]) {
              departementsOnRegionsRemote[id] = {
                id: departement.region.id,
                label: departement.region.label,
                selected: departementSelected?.isRemote ?? false,
                children: [
                  {
                    label: departement.label,
                    id: departement.id,
                    selected: departementSelected?.isRemote ?? false,
                    code: departement.code,
                  },
                ],
              };
            } else {
              const regionIsSelected = departementsOnRegionsRemote[
                id
              ].children?.every((departement) => departement.selected);

              departementsOnRegionsRemote[id].selected =
                (regionIsSelected && departementSelected?.isRemote) || false;
              departementsOnRegionsRemote[id].children?.push({
                label: departement.label,
                id: departement.id,
                selected: departementSelected?.isRemote ?? false,
                code: departement.code,
              });
            }
          }

          if (estSurPlace) {
            if (!departementsOnRegionsOnSite[id]) {
              departementsOnRegionsOnSite[id] = {
                id: departement.region.id,
                label: departement.region.label,
                selected: departementSelected?.isOnSite ?? false,
                children: [
                  {
                    label: departement.label,
                    id: departement.id,
                    selected: departementSelected?.isOnSite ?? false,
                    code: departement.code,
                  },
                ],
              };
            } else {
              const regionIsSelected = departementsOnRegionsOnSite[
                id
              ].children?.every((departement) => departement.selected);

              departementsOnRegionsOnSite[id].selected =
                (regionIsSelected && departementSelected?.isOnSite) || false;

              departementsOnRegionsOnSite[id].children?.push({
                label: departement.label,
                id: departement.id,
                selected: departementSelected?.isOnSite ?? false,
                code: departement.code,
              });
            }
          }
        },
      );

      organismOndepartementsOnRegionsOnSite.current =
        sortDepartmentsByAlphabeticalOrderAndDOM(
          Object.values(departementsOnRegionsOnSite),
        );

      organismOndepartementsOnRegionsRemote.current =
        sortDepartmentsByAlphabeticalOrderAndDOM(
          Object.values(departementsOnRegionsRemote),
        );

      setValue(
        "zoneInterventionPresentiel",
        organismOndepartementsOnRegionsOnSite.current,
      );
      setValue(
        "zoneInterventionDistanciel",
        organismOndepartementsOnRegionsRemote.current,
      );
    }
  }, [
    maisonMereAAPOnDepartements,
    setValue,
    zoneInterventionDistanciel?.length,
    zoneInterventionPresentiel?.length,
    organism,
  ]);

  return {
    organismOndepartementsOnRegionsOnSite:
      organismOndepartementsOnRegionsOnSite.current,
    organismOndepartementsOnRegionsRemote:
      organismOndepartementsOnRegionsRemote.current,
  };
}
