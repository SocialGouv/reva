import {
  Prisma,
  Account,
  CertificationAuthorityLocalAccount,
} from "@prisma/client";

export const getJuryListQueryWhereClauseForUserWithManageRole = ({
  account,
  isCertificationAuthorityLocalAccount,
  certificationAuthorityLocalAccount,
}: {
  account: Account | null;
  isCertificationAuthorityLocalAccount: boolean;
  certificationAuthorityLocalAccount: CertificationAuthorityLocalAccount | null;
}): Prisma.JuryWhereInput => {
  let queryWhereClause: Prisma.JuryWhereInput = {};

  // For certification authority local accounts we restric matches to the local account own departments and certifications
  if (isCertificationAuthorityLocalAccount) {
    if (!certificationAuthorityLocalAccount) {
      throw new Error(
        "Compte local de l'autorité de certification non trouvée",
      );
    }

    queryWhereClause = {
      ...queryWhereClause,
      certificationAuthorityId:
        certificationAuthorityLocalAccount?.certificationAuthorityId,
      candidacy: {
        certificationAuthorityLocalAccountOnCandidacy: {
          some: {
            certificationAuthorityLocalAccountId:
              certificationAuthorityLocalAccount.id,
          },
        },
      },
    };
  } else {
    queryWhereClause = {
      ...queryWhereClause,
      certificationAuthorityId: account?.certificationAuthorityId || "_",
    };
  }

  return queryWhereClause;
};
