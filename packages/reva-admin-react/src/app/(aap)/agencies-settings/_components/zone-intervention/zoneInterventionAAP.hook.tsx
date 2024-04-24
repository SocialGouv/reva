import { TreeSelectRegion } from "@/types";
import { sortDepartmentsByAlphabeticalOrderAndDOM } from "@/utils";
import { useCallback } from "react";

interface ZoneInterventionMaisonMere {
  departement: {
    id: string;
    code: string;
    label: string;
    region: { id: string; label: string };
  };
  estADistance: boolean;
  estSurPlace: boolean;
}

interface ZoneInterventionOrganism {
  departmentId: string;
  isRemote: boolean;
  isOnSite: boolean;
}

export const useZoneInterventionAAP = () => {
  const getZonesIntervention = useCallback(
    ({
      maisonMereAAPOnDepartements,
      organismOnDepartments,
    }: {
      maisonMereAAPOnDepartements: ZoneInterventionMaisonMere[];
      organismOnDepartments?: ZoneInterventionOrganism[];
    }) => {
      const departementsOnRegionsRemote: Record<string, TreeSelectRegion> = {};
      const departementsOnRegionsOnSite: Record<string, TreeSelectRegion> = {};

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

    const fillZone = (zone: TreeSelectRegion[], type: "ON_SITE" | "REMOTE") => {
      zone.forEach((region) => {
        (region.children || []).forEach((departement) => {
          if (departement.selected) {
            if (!interventionZone[departement.id]) {
              interventionZone[departement.id] = {
                isOnSite: false,
                isRemote: false,
              };
            }
            switch (type) {
              case "ON_SITE":
                interventionZone[departement.id].isOnSite = true;
                break;
              case "REMOTE":
                interventionZone[departement.id].isRemote = true;
                break;
            }
          }
        });
      });
    };

    fillZone(onSiteZone, "ON_SITE");
    fillZone(remoteZone, "REMOTE");

    return Object.entries(interventionZone)
      .filter(([, { isOnSite, isRemote }]) => isOnSite || isRemote)
      .map(([departmentId, { isOnSite, isRemote }]) => ({
        departmentId,
        isOnSite,
        isRemote,
      }));
  };

  return { getZonesIntervention, mergeZonesIntervention };
};
