export const getDateWithoutTz = (date?: Date | number | null) => {
  if (!date) return null;

  const birthDateObject = new Date(date);
  // En production, la date de naissance stockée représente la veille de la date de naissance, à 23h en UTC.
  // Pour obtenir un affichage correct quelle que soit la timezone de l'utilisateur, on ajoute 1 heure
  // afin d'obtenir la bonne date (00h en UTC le jour de naissance), puis on compense ensuite en ajoutant le décalage du fuseau
  // horaire de l'utilisateur. Ce résultat sera ensuite passé à la fonction format() de date-fns qui l'affichera correctement.
  return new Date(
    birthDateObject.valueOf() +
      (birthDateObject.getTimezoneOffset() + 60) * 60 * 1000,
  );
};
