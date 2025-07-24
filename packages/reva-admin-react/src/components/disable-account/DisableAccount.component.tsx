import { useHooks } from "./DisableAccount.hooks";

import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";

import { useAuth } from "../auth/auth";

import { successToast, graphqlErrorToast } from "@/components/toast/toast";

interface Props {
  accountId: string;
}

const modal = createModal({
  id: "confirm-disable",
  isOpenedByDefault: false,
});

export const DisableAccount = (props: Props) => {
  const { accountId } = props;

  const { isAdmin } = useAuth();

  const { disableUserAccount } = useHooks();

  return isAdmin ? (
    <>
      <Button
        priority="tertiary no outline"
        type="button"
        iconId="fr-icon-delete-line"
        onClick={modal.open}
      >
        Désactiver ce collaborateur
      </Button>

      <modal.Component
        title={
          <div>
            <span
              className="fr-icon-warning-fill mr-2"
              aria-hidden="true"
            ></span>
            Voulez-vous désactiver ce collaborateur ?
          </div>
        }
        size="large"
        buttons={[
          {
            type: "button",
            priority: "primary",
            onClick: async () => {
              try {
                await disableUserAccount.mutateAsync(accountId);
                successToast("Compte désactivé avec succès");
              } catch (error) {
                graphqlErrorToast(error);
              }
            },
            children: "Désactiver ce collaborateur",
          },
        ]}
      >
        <p>
          Attention, cette action est irréversible. Si ce collaborateur gère
          encore des candidatures, elles devront être prises en charge par un
          autre collaborateur de la structure.
        </p>
      </modal.Component>
    </>
  ) : null;
};
