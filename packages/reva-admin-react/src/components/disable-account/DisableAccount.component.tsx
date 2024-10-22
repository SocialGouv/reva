import Button from "@codegouvfr/react-dsfr/Button";

import { successToast, graphqlErrorToast } from "@/components/toast/toast";

import { useAuth } from "../auth/auth";

import { useHooks } from "./DisableAccount.hooks";

interface Props {
  accountId: string;
  size?: "small" | "medium" | "large";
}

export const DisableAccount = (props: Props): JSX.Element | null => {
  const { accountId, size } = props;

  const { isAdmin } = useAuth();

  const { disableUserAccount } = useHooks();

  return isAdmin ? (
    <Button
      priority="tertiary no outline"
      type="button"
      size={size}
      onClick={async () => {
        try {
          await disableUserAccount.mutateAsync(accountId);
          successToast("Compte désactivé avec succès");
        } catch (error) {
          graphqlErrorToast(error);
        }
      }}
    >
      Désactiver
    </Button>
  ) : null;
};
