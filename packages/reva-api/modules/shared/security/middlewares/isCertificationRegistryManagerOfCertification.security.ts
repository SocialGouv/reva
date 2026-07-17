import { IFieldResolver, MercuriusContext } from "mercurius";

import { isUserCertificationRegistryManagerOfCertification } from "@/modules/certification-authority/features/isUserCertificationRegistryManagerOfCertification";
import { NOT_AUTHORIZED_CERTIFICATION_ACCESS } from "@/modules/shared/security/messages";

export const isCertificationRegistryManagerOfCertification =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    if (
      !(await isUserCertificationRegistryManagerOfCertification({
        userRoles: context.auth.userInfo.realm_access?.roles || [],
        certificationId:
          args.certificationId ||
          args.data?.certificationId ||
          args.input?.certificationId ||
          root.certificationId ||
          root.id,
        userKeycloakId: context.auth.userInfo.sub,
      }))
    ) {
      throw new Error(NOT_AUTHORIZED_CERTIFICATION_ACCESS);
    }
    return next(root, args, context, info);
  };
