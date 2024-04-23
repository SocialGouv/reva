import { TreeSelectRegion } from "@/types";
import { sortDepartmentsByAlphabeticalOrderAndDOM } from "@/utils";
import { useCallback } from "react";

export const useZoneInterventionAAP = () => {
  const getZonesInterventionMaisonMereAAP = useCallback(
    ({
      maisonMereAAPOnDepartements,
    }: {
      maisonMereAAPOnDepartements: {
        departement: {
          id: string;
          code: string;
          label: string;
          region: { id: string; label: string };
        };
        estADistance: boolean;
        estSurPlace: boolean;
      }[];
    }) => {
      const departementsOnRegionsRemote: Record<string, TreeSelectRegion> = {};
      const departementsOnRegionsOnSite: Record<string, TreeSelectRegion> = {};

      maisonMereAAPOnDepartements?.forEach(
        ({ departement, estADistance, estSurPlace }) => {
          const id = departement.region.id;

          if (estADistance) {
            if (!departementsOnRegionsRemote[id]) {
              departementsOnRegionsRemote[id] = {
                id: departement.region.id,
                label: departement.region.label,
                selected: false,
                children: [
                  {
                    label: departement.label,
                    id: departement.id,
                    selected: false,
                    code: departement.code,
                  },
                ],
              };
            } else {
              departementsOnRegionsRemote[id].selected = false;
              departementsOnRegionsRemote[id].children?.push({
                label: departement.label,
                id: departement.id,
                selected: false,
                code: departement.code,
              });
            }
          }

          if (estSurPlace) {
            if (!departementsOnRegionsOnSite[id]) {
              departementsOnRegionsOnSite[id] = {
                id: departement.region.id,
                label: departement.region.label,
                selected: false,
                children: [
                  {
                    label: departement.label,
                    id: departement.id,
                    selected: false,
                    code: departement.code,
                  },
                ],
              };
            } else {
              departementsOnRegionsOnSite[id].selected = false;

              departementsOnRegionsOnSite[id].children?.push({
                label: departement.label,
                id: departement.id,
                selected: false,
                code: departement.code,
              });
            }
          }
        },
      );

      return {
        onSite: sortDepartmentsByAlphabeticalOrderAndDOM(
          Object.values(departementsOnRegionsOnSite),
        ),
        remote: sortDepartmentsByAlphabeticalOrderAndDOM(
          Object.values(departementsOnRegionsRemote),
        ),
      };
    },
    [],
  );

  const mergeZonesIntervention = ({
    onSiteZone,
    remoteZone,
  }: {
    onSiteZone: TreeSelectRegion[];
    remoteZone: TreeSelectRegion[];
  }) => {
    const interventionZone: Record<
      string,
      { isOnSite: boolean; isRemote: boolean }
    > = {};

    const fillZone = (zone: TreeSelectRegion[]) => {
      zone.forEach((region) => {
        (region.children || []).forEach((departement) => {
          if (departement.selected) {
            if (!interventionZone[departement.id]) {
              interventionZone[departement.id] = {
                isOnSite: true,
                isRemote: false,
              };
            } else {
              interventionZone[departement.id].isOnSite = true;
            }
          }
        });
      });
    };

    fillZone(onSiteZone);
    fillZone(remoteZone);

    return Object.entries(interventionZone)
      .filter(([, { isOnSite, isRemote }]) => isOnSite || isRemote)
      .map(([departmentId, { isOnSite, isRemote }]) => ({
        departmentId,
        isOnSite,
        isRemote,
      }));
  };

  return { getZonesInterventionMaisonMereAAP, mergeZonesIntervention };
};
