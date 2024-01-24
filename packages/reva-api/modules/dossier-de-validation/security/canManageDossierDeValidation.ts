import { IFieldResolver, MercuriusContext } from "mercurius";

import { canManageDossierDeValidation as canManageDossierDeValidationFeature } from "../features/canManageDossierDeValidation";

export const canManageDossierDeValidation =
  (next: IFieldResolver<unknown>) =>
  async (
    root: unknown,
    args: { dossierDeValidationId?: string; [x: string]: unknown },
    context: MercuriusContext,
    info: any
  ) => {
    const dossierDeValidationId = args.dossierDeValidationId ?? "";
    const keycloakId = context.auth.userInfo?.sub ?? "";
    const roles = context.auth.userInfo?.realm_access?.roles || [];
    const authorized = await canManageDossierDeValidationFeature({
      roles,
      dossierDeValidationId,
      keycloakId,
    });
    if (!authorized) {
      throw new Error("Vous n'êtes pas autorisé à gérer cette candidature.");
    }
    return next(root, args, context, info);
  };
