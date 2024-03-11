const isOutreMere = (region: { code: string }) => {
  return ["01", "02", "03", "04", "06"].includes(region.code);
};

export const sortRegionsByAlphabeticalOrderAndDOM = (
  unsortedRegions: {
    id: string;
    label: string;
    code: string;
    departments: { id: string; label: string; code: string }[];
  }[],
) => {
  return unsortedRegions.sort((regionA, regionB) => {
    if (isOutreMere(regionA) && !isOutreMere(regionB)) {
      return 1;
    }

    if (!isOutreMere(regionA) && isOutreMere(regionB)) {
      return -1;
    }

    return regionA.label.localeCompare(regionB.label);
  });
};
