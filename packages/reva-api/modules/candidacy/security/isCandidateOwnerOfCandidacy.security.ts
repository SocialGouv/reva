import { IFieldResolver, MercuriusContext } from "mercurius";
import { isCandidateOwnerOfCandidacy as isCandidateOwnerOfCandidacyFeature } from "../features/isCandidateOwnerOfCandidacy";

export const isCandidateOwnerOfCandidacy =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    if (
      !(await isCandidateOwnerOfCandidacyFeature({
        candidacyId: args["candidacyId"],
        keycloakId: context.auth.userInfo?.sub,
      }))
    ) {
      throw new Error("Vous n'êtes pas autorisé à accéder à cette candidature");
    }
    return next(root, args, context, info);
  };
