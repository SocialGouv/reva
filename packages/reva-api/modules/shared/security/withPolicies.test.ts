import { allowed } from "./middlewares/allowed";
import { forbidden } from "./middlewares/forbidden";
import { withPolicies } from "./withPolicies";

describe("withPolicies", () => {
  test("applique la policy `allowed` en laissant passer le resolver", () => {
    const resolvers = {
      Query: {
        open: () => "ok",
      },
    };

    const secured = withPolicies(resolvers, {
      Query: { open: [allowed] },
    });

    expect((secured.Query.open as any)(null, {}, {}, {})).toBe("ok");
  });

  test("applique la policy `forbidden` en bloquant le resolver", () => {
    const resolvers = {
      Query: {
        secret: () => "sensible",
      },
    };

    const secured = withPolicies(resolvers, {
      Query: { secret: [forbidden] },
    });

    expect(() => (secured.Query.secret as any)(null, {}, {}, {})).toThrow(
      "Forbidden (default security)",
    );
  });

  test("aplatit chaque type/champ vers une clé `Type.field`", () => {
    const resolvers = {
      Query: { a: () => "a" },
      Mutation: { b: () => "b" },
      Candidacy: { c: () => "c" },
    };

    const secured = withPolicies(resolvers, {
      Query: { a: [allowed] },
      Mutation: { b: [forbidden] },
      Candidacy: { c: [allowed] },
    });

    expect((secured.Query.a as any)(null, {}, {}, {})).toBe("a");
    expect(() => (secured.Mutation.b as any)(null, {}, {}, {})).toThrow();
    expect((secured.Candidacy.c as any)(null, {}, {}, {})).toBe("c");
  });

  test("exhaustivité compile-time: champ manquant ou fantôme = erreur de type", () => {
    const r = { Query: { open: () => "ok" } };

    // @ts-expect-error - `open` manquant: chaque champ doit avoir une policy
    withPolicies(r, { Query: {} });

    // @ts-expect-error - `ghost` inexistant: pas de clé fantôme autorisée
    withPolicies(r, { Query: { open: [allowed], ghost: [allowed] } });

    // Cas exhaustif correct: prouve que les @ts-expect-error ne sont pas des faux positifs.
    withPolicies(r, { Query: { open: [allowed] } });
  });
});
