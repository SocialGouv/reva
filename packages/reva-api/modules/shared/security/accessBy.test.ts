import { IFieldResolver } from "mercurius";

import { accessBy, ALLOW } from "./accessBy";
import { hasRole, whenHasRole } from "./middlewares";
import { isAdmin } from "./presets";
import { Middleware } from "./withPolicies";

// --- Outillage de test (sans DB) ---

// Contexte factice: pilote les rôles détenus par l'appelant.
const makeCtx = (roles: string[]) =>
  ({
    auth: {
      userInfo: { sub: "user-test" },
      hasRole: (role: string) => roles.includes(role),
    },
  }) as any;

// Applique une policy (tableau de middlewares) comme le fait le moteur runtime
// (premier middleware = plus externe) et renvoie "allow" ou "deny".
const runPolicy = async (
  policy: Middleware[],
  roles: string[],
): Promise<"allow" | "deny"> => {
  const base: IFieldResolver<unknown> = () => "OK";
  const chain = policy.reduceRight<IFieldResolver<unknown>>(
    (next, middleware) => (middleware as any)(next),
    base,
  );
  try {
    await chain({}, {}, makeCtx(roles), {} as any);
    return "allow";
  } catch {
    return "deny";
  }
};

// Toutes les combinaisons de rôles détenus (power set).
const subsets = <T>(items: T[]): T[][] =>
  items.reduce<T[][]>(
    (acc, item) => acc.concat(acc.map((s) => [...s, item])),
    [[]],
  );

// Prouve que deux policies rendent un verdict identique sur toute la matrice de rôles.
const assertPolicyEquivalent = async (
  a: Middleware[],
  b: Middleware[],
  roles: string[],
) => {
  for (const held of subsets(roles)) {
    const [ra, rb] = [await runPolicy(a, held), await runPolicy(b, held)];
    expect(rb, `rôles détenus=[${held.join(",")}]`).toBe(ra);
  }
};

// Sentinelles d'ownership (sans DB) pour tester le combinateur.
const ownAllow =
  (next: IFieldResolver<unknown>): IFieldResolver<unknown> =>
  (root, args, context, info) =>
    next(root, args, context, info);
const ownDeny = (): IFieldResolver<unknown> => () => {
  throw new Error("ownership refusé");
};

// --- Combinateur ---

describe("accessBy", () => {
  test("la porte de rôle refuse un appelant sans aucun rôle autorisé", async () => {
    const policy = accessBy({ admin: ALLOW });
    expect(await runPolicy(policy, ["candidate"])).toBe("deny");
    expect(await runPolicy(policy, ["admin"])).toBe("allow");
  });

  test("ALLOW: le rôle passe sans contrôle d'ownership", async () => {
    const policy = accessBy({ manage_candidacy: ALLOW });
    expect(await runPolicy(policy, ["manage_candidacy"])).toBe("allow");
  });

  test("un rôle à ownership: le contrôle s'applique seulement si le rôle est présent", async () => {
    const policy = accessBy({ admin: ALLOW, manage_candidacy: ownDeny });
    // admin seul: le contrôle manage_candidacy est ignoré (rôle absent) -> autorisé
    expect(await runPolicy(policy, ["admin"])).toBe("allow");
    // manage_candidacy: le contrôle s'applique -> refusé
    expect(await runPolicy(policy, ["manage_candidacy"])).toBe("deny");
  });

  test("un rôle à ownership qui passe est autorisé", async () => {
    const policy = accessBy({ manage_candidacy: ownAllow });
    expect(await runPolicy(policy, ["manage_candidacy"])).toBe("allow");
  });

  test("extra: contrôle appliqué à tout appelant autorisé", async () => {
    const policy = accessBy({ admin: ALLOW }, [ownDeny]);
    expect(await runPolicy(policy, ["admin"])).toBe("deny");
  });
});

// --- Équivalence de comportement ---

describe("accessBy - équivalence de comportement", () => {
  const rolesMatrix = ["admin", "candidate", "manage_candidacy"];

  test("reproduit une chaîne hasRole+whenHasRole écrite à la main", async () => {
    const handWritten: Middleware[] = [
      hasRole(["admin", "manage_candidacy"]),
      whenHasRole("manage_candidacy", ownDeny),
    ];
    const viaAccessBy = accessBy({ admin: ALLOW, manage_candidacy: ownDeny });
    await assertPolicyEquivalent(handWritten, viaAccessBy, rolesMatrix);
  });

  test("isAdmin ≡ [hasRole(['admin'])]", async () => {
    const hasRoleAdmin: Middleware[] = [hasRole(["admin"])];
    await assertPolicyEquivalent(hasRoleAdmin, isAdmin, rolesMatrix);
  });
});
