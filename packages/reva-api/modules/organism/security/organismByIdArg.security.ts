import { IFieldResolver, MercuriusContext } from "mercurius";

import { NOT_AUTHORIZED_ORGANISM_ACCESS } from "@/modules/shared/security/messages";

// Signature commune aux features de contrôle d'accès à un organisme.
type OrganismAccessCheck = (params: {
  userRoles: KeyCloakUserRole[];
  userKeycloakId: string;
  organismId: string;
}) => Promise<boolean>;

// Fabrique un middleware clé sur `args.id` UNIQUEMENT, sans repli : `organism_getOrganism(id:)`
// n'expose ni `organismId` ni `data.organismId`, donc les middlewares organisme existants ne s'y
// appliquent pas. Ajouter `args.id` à leur liste de clés changerait le comportement de tous leurs
// autres consommateurs, d'où ces middlewares dédiés.
export const organismByIdArg =
  (isAllowed: OrganismAccessCheck) =>
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    if (
      !(await isAllowed({
        userRoles: context.auth.userInfo.realm_access?.roles || [],
        organismId: args.id,
        userKeycloakId: context.auth.userInfo.sub,
      }))
    ) {
      throw new Error(NOT_AUTHORIZED_ORGANISM_ACCESS);
    }
    return next(root, args, context, info);
  };
