import { getFeatureByKey } from "../../feature-flipping/feature-flipping.features";
import { prismaClient } from "../../../prisma/client";

export const isOrganismVisibleInCandidateSearchResults = async ({
  organismId,
}: {
  organismId: string;
}) => {
  const o = await prismaClient.organism.findUnique({
    where: { id: organismId },
    include: {
      managedDegrees: true,
      organismOnDomaine: true,
      organismOnFormacode: true,
      organismOnConventionCollective: true,
      organismInformationsCommerciales: true,
    },
  });

  if (!o) {
    return false;
  }

  const isFormacodeActive = await isFormacodeFeatureActive();
  const domainsLength = isFormacodeActive
    ? o.organismOnFormacode.length
    : o.organismOnDomaine.length;

  return (
    o.isActive &&
    (o.isOnSite || o.isRemote) &&
    !o.fermePourAbsenceOuConges &&
    o.managedDegrees.length &&
    (domainsLength || o.organismOnConventionCollective.length)
  );
};

const isFormacodeFeatureActive = async (): Promise<boolean> => {
  const isAapSettingsFormacodeActive = (
    await getFeatureByKey("AAP_SETTINGS_FORMACODE")
  )?.isActive;

  return !!isAapSettingsFormacodeActive;
};
