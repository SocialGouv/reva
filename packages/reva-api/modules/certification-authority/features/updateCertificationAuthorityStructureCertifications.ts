import { prismaClient } from "@/prisma/client";

// Cette fonction met à jour les liaisons entre une structure certificatrice et ses certifications.
// Attention : l'opération de mise à jour remplace toutes les liaisons existantes par les nouvelles.
// Si une certification est déjà liée à une autre structure certificatrice, cette liaison sera supprimée.
export const updateCertificationAuthorityStructureCertifications = ({
  certificationAuthorityStructureId,
  certificationIds,
}: {
  certificationAuthorityStructureId: string;
  certificationIds: string[];
}) =>
  prismaClient.certificationAuthorityStructure.update({
    where: { id: certificationAuthorityStructureId },
    data: { certifications: { set: certificationIds.map((id) => ({ id })) } },
  });
