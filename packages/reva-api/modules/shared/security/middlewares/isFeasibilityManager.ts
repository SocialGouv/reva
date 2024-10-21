import debug from "debug";
import { IFieldResolver, MercuriusContext } from "mercurius";
import { prismaClient } from "../../../../prisma/client";
const log = debug("gql:security");

export const isFeasibilityManager =
  (next: IFieldResolver<unknown>) =>
  async (
    root: any,
    args: Record<string, any>,
    context: MercuriusContext,
    info: any,
  ) => {
    log("isFeasibilityManager");
    const candidacyId =
      args.candidacyId || args.data?.candidacyId || root.candidacyId || root.id;

    if (context.auth.hasRole("manage_certification_authority_local_account")) {
      const candidacyFeasibility = await prismaClient.feasibility.findFirst({
        where: { candidacyId, isActive: true },
      });

      const account = await prismaClient.account.findFirst({
        where: { keycloakId: context.auth.userInfo.sub },
      });

      if (!candidacyFeasibility || !account) {
        throw new Error("Vous n'êtes pas autorisé à gérer cette candidature.");
      }

      if (
        candidacyFeasibility.certificationAuthorityId ===
        account.certificationAuthorityId
      ) {
        log("authorized");
        return next(root, args, context, info);
      }
    } else if (context.auth.hasRole("manage_feasibility")) {
      const candidacyFeasibility = await prismaClient.feasibility.findFirst({
        where: { candidacyId, isActive: true },
        select: {
          certificationAuthorityId: true,
          candidacy: {
            select: {
              certification: {
                select: {
                  id: true,
                },
              },
              department: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!candidacyFeasibility) {
        throw new Error("Candidature inexistante.");
      }

      const certificationAuthorityLocalAccount =
        await prismaClient.certificationAuthorityLocalAccount.findFirst({
          where: { account: { keycloakId: context.auth.userInfo.sub } },
          include: {
            certificationAuthorityLocalAccountOnCertification: true,
            certificationAuthorityLocalAccountOnDepartment: true,
          },
        });

      if (!certificationAuthorityLocalAccount) {
        throw new Error("Vous n'êtes pas autorisé à gérer cette candidature.");
      }

      const candidacyCertificationId =
        candidacyFeasibility.candidacy.certification?.id;

      const candidacyDepartmentId =
        candidacyFeasibility.candidacy.department?.id;

      const candidacyCertificationAuthorityId =
        candidacyFeasibility.certificationAuthorityId;

      const matchCertificationAuthority =
        certificationAuthorityLocalAccount?.certificationAuthorityId ===
        candidacyCertificationAuthorityId;

      const matchCertification =
        certificationAuthorityLocalAccount.certificationAuthorityLocalAccountOnCertification.some(
          (c) => c.certificationId === candidacyCertificationId,
        );
      const matchDepartment =
        certificationAuthorityLocalAccount.certificationAuthorityLocalAccountOnDepartment.some(
          (d) => d.departmentId === candidacyDepartmentId,
        );

      if (
        matchCertificationAuthority &&
        matchCertification &&
        matchDepartment
      ) {
        log("authorized");
        return next(root, args, context, info);
      }
    }

    log("not authorized");
    throw new Error("Vous n'êtes pas autorisé à gérer cette candidature.");
  };
