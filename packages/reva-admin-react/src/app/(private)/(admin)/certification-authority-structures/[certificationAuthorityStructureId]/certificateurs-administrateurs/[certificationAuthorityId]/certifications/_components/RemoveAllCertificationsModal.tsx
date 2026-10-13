"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { graphql } from "@/graphql/generated";

const removeAllCertificationAuthorityCertificationsMutation = graphql(`
  mutation removeAllCertificationAuthorityCertificationsForAdminCertificationsPage(
    $certificationAuthorityId: ID!
  ) {
    certification_authority_removeAllCertificationAuthorityCertifications(
      certificationAuthorityId: $certificationAuthorityId
    )
  }
`);

const removeAllCertificationsModal = createModal({
  id: "remove-all-certification-authority-certifications-modal",
  isOpenedByDefault: false,
});

export const RemoveAllCertificationsModal = ({
  certificationAuthorityId,
}: {
  certificationAuthorityId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const removeAllCertificationAuthorityCertifications = useMutation({
    mutationFn: ({
      certificationAuthorityId,
    }: {
      certificationAuthorityId: string;
    }) =>
      graphqlClient.request(
        removeAllCertificationAuthorityCertificationsMutation,
        { certificationAuthorityId },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [certificationAuthorityId],
      }),
  });

  const handleRemoveAllCertificationAuthorityCertifications = async () => {
    try {
      await removeAllCertificationAuthorityCertifications.mutateAsync({
        certificationAuthorityId,
      });
      removeAllCertificationsModal.close();
      successToast("Les certifications gérées ont été supprimées");
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return (
    <>
      <removeAllCertificationsModal.Component
        title="Suppression des certifications gérées"
        buttons={[
          {
            priority: "secondary",
            children: "Annuler",
          },
          {
            priority: "primary",
            children: "Valider",
            doClosesModal: false,
            onClick: handleRemoveAllCertificationAuthorityCertifications,
            disabled: removeAllCertificationAuthorityCertifications.isPending,
            nativeButtonProps: {
              "data-testid":
                "remove-all-certification-authority-certifications-confirm-button",
            },
          },
        ]}
      >
        <p>
          Toutes les certifications gérées par ce certificateur administrateur
          seront retirées. S'il y avait des parcours associés à ces
          certifications, ils seront également supprimés. Cette action est
          irréversible.
        </p>
      </removeAllCertificationsModal.Component>
      <Button
        priority="secondary"
        iconId="fr-icon-delete-line"
        onClick={() => removeAllCertificationsModal.open()}
        nativeButtonProps={{
          "data-testid":
            "remove-all-certification-authority-certifications-button",
        }}
      >
        Supprimer les certifications gérées
      </Button>
    </>
  );
};
