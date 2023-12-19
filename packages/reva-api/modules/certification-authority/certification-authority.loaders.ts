import { getAccountsByIds } from "../account/features/getAccountsByIds";
import { getCertificationRelationsByCertificationAuthorityLocalAccountIds } from "./features/getCertificationRelationsByCertificationAuthorityLocalAccountIds";
import { getDepartmentRelationsByCertificationAuthorityLocalAccountIds } from "./features/getDepartmentRelationsByCertificationAuthorityLocalAccountIds";

export const certificationAuthorityLoaders = {
  CertificationAuthorityLocalAccount: {
    departments: async (queries: { obj: { id: string } }[]) => {
      const calaIds: string[] = queries.map(({ obj }) => obj.id);

      const departmentRelations =
        await getDepartmentRelationsByCertificationAuthorityLocalAccountIds({
          certificationAuthorityLocalAccountIds: calaIds,
        });

      return calaIds.map((cid) =>
        departmentRelations
          .filter((dr) => dr.certificationAuthorityLocalAccountId === cid)
          .map((dr) => dr.department)
      );
    },

    certifications: async (queries: { obj: { id: string } }[]) => {
      const calaIds: string[] = queries.map(({ obj }) => obj.id);

      const certificationRelations =
        await getCertificationRelationsByCertificationAuthorityLocalAccountIds({
          certificationAuthorityLocalAccountIds: calaIds,
        });

      return calaIds.map((cid) =>
        certificationRelations
          .filter((cr) => cr.certificationAuthorityLocalAccountId === cid)
          .map((cr) => cr.certification)
      );
    },

    account: async (queries: { obj: { accountId: string } }[]) => {
      const accountIds: string[] = queries.map(({ obj }) => obj.accountId);

      const accounts = await getAccountsByIds({
        accountIds,
      });

      return accountIds.map((aid) => accounts.find((a) => a.id === aid));
    },
  },
};
