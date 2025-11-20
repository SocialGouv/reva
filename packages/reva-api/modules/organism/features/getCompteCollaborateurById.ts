import { getAccountById } from "@/modules/account/features/getAccount";

export const getCompteCollaborateurById = async ({
  accountId,
}: {
  accountId: string;
}) => getAccountById({ id: accountId });
