// Le département d'un candidat est facultatif en base : il n'est renseigné
// qu'une fois son code postal saisi.
export const getCandidateDepartmentIdOrThrow = (
  candidate?: { departmentId: string | null } | null,
): string => {
  if (!candidate?.departmentId) {
    throw new Error("Le candidat de test n'a pas de département");
  }

  return candidate.departmentId;
};
