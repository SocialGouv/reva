import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { successToast, graphqlErrorToast } from "@/components/toast/toast";

import { graphql } from "@/graphql/generated";

const modal = createModal({
  id: "confirm-disable",
  isOpenedByDefault: false,
});

const disableCompteCollaborateurMutation = graphql(`
  mutation disableCompteCollaborateurMutationForDisableCompteCollaborateurAAPTile(
    $maisonMereAAPId: ID!
    $accountId: ID!
  ) {
    organism_disableCompteCollaborateur(
      maisonMereAAPId: $maisonMereAAPId
      accountId: $accountId
    )
  }
`);

export const DisableCompteCollaborateurAAPTile = ({
  accountId,
  maisonMereAAPId,
}: {
  accountId: string;
  maisonMereAAPId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const disableUserAccount = useMutation({
    mutationFn: (accountId: string) =>
      graphqlClient.request(disableCompteCollaborateurMutation, {
        maisonMereAAPId,
        accountId,
      }),
    mutationKey: ["accountId"],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [accountId],
      });
    },
  });

  const handleDisableUserAccountConfirmation = async () => {
    try {
      await disableUserAccount.mutateAsync(accountId);
      successToast("Compte désactivé avec succès");
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  return (
    <>
      <Tile
        title="Désactiver le compte collaborateur"
        desc="Ce collaborateur n’aura plus accès à la plateforme."
        detail={
          <>
            <span
              className="fr-icon-warning-fill fr-icon--sm mr-2"
              aria-hidden="true"
            />
            <span>
              La désactivation d’un compte collaborateur est irréversible.
            </span>
          </>
        }
        small
        enlargeLinkOrButton
        orientation="horizontal"
        buttonProps={{
          onClick: modal.open,
        }}
      />

      <modal.Component
        title={
          <div>
            <span
              className="fr-icon-warning-fill mr-2"
              aria-hidden="true"
            ></span>
            Voulez-vous désactiver ce compte collaborateur ?
          </div>
        }
        size="large"
        buttons={[
          {
            priority: "secondary",
            children: "Annuler",
          },
          {
            type: "button",
            priority: "primary",
            onClick: handleDisableUserAccountConfirmation,
            children: "Désactiver",
          },
        ]}
      >
        <p>
          Attention, cette action est irréversible. La désactivation de ce
          collaborateur n’impactera pas la visibilité des candidatures.
        </p>
      </modal.Component>
    </>
  );
};
