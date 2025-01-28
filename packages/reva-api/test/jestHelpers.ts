export const shouldNotGoHere = () => {
  throw new Error(
    "Ce test a échoué car la requête GraphQL n'a pas levé l'erreur attendue",
  );
};
