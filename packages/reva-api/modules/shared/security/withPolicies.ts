import {
  composeResolvers,
  ResolversComposerMapping,
  ResolversComposition,
} from "@graphql-tools/resolvers-composition";

// Un middleware enveloppe un resolver : HOF `(next) => resolver`.
export type Middleware = ResolversComposition;

// Une policy : un tableau de middlewares appliqués en AND.
type Policy = ReadonlyArray<Middleware>;

// Exige une policy pour CHAQUE champ de CHAQUE type du resolver. `resolvers` étant un
// littéral d'objet, TS infère ses clés exactes : oublier un champ = erreur de compilation,
// ajouter une clé inexistante = erreur aussi.
type PoliciesFor<R> = {
  [TypeName in keyof R]: { [Field in keyof R[TypeName]]: Policy };
};

// Aplatit `{ Query: { x: policy } }` en `{ "Query.x": policy }` puis délègue à
// composeResolvers. Aucun wildcard : l'exhaustivité est garantie par le type `PoliciesFor`.
export function withPolicies<R extends Record<string, Record<string, unknown>>>(
  resolvers: R,
  policies: PoliciesFor<R>,
): R {
  const map: Record<string, Middleware[]> = {};
  const flat = policies as Record<string, Record<string, Policy>>;
  for (const typeName of Object.keys(flat)) {
    for (const field of Object.keys(flat[typeName])) {
      map[`${typeName}.${field}`] = [...flat[typeName][field]];
    }
  }
  return composeResolvers(resolvers, map as ResolversComposerMapping<R>);
}
