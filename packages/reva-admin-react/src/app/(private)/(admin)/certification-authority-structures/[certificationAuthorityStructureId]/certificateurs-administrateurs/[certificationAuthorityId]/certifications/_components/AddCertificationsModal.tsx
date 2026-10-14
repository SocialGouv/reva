"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import {
  errorToast,
  graphqlErrorToast,
  successToast,
} from "@/components/toast/toast";

import { graphql } from "@/graphql/generated";

const getActiveCertificationsQuery = graphql(`
  query getActiveCertifications($filters: ActiveCertificationsFiltersInput) {
    getActiveCertifications(filters: $filters) {
      id
      codeRncp
      label
      level
    }
  }
`);

const updateCertificationAuthorityCertificationsMutation = graphql(`
  mutation updateCertificationAuthorityForAdminCertificationsPage(
    $certificationAuthorityId: ID!
    $certificationIds: [String!]!
  ) {
    certification_authority_updateCertificationAuthorityCertifications(
      certificationAuthorityId: $certificationAuthorityId
      certificationIds: $certificationIds
    ) {
      id
    }
  }
`);

const addCertificationsModal = createModal({
  id: "add-certification-authority-certifications-modal",
  isOpenedByDefault: false,
});

const RNCP_CODE_SEPARATORS = /[,;\s]+/;

const normalizeRncpCode = (code: string) => code.trim().replace(/^rncp/i, "");

const parseRncpCodes = (value: string) => {
  const codes: string[] = [];
  const seen = new Set<string>();

  for (const token of value.split(RNCP_CODE_SEPARATORS)) {
    const code = normalizeRncpCode(token);
    const comparableCode = code.toLowerCase();

    if (!code || seen.has(comparableCode)) {
      continue;
    }

    seen.add(comparableCode);
    codes.push(code);
  }

  return codes;
};

export const AddCertificationsModal = ({
  certificationAuthorityId,
  currentCertificationIds,
}: {
  certificationAuthorityId: string;
  currentCertificationIds: string[];
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();
  const [codesInput, setCodesInput] = useState("");
  const [isCertificationsQueryEnabled, setIsCertificationsQueryEnabled] =
    useState(false);

  const { data, isError } = useQuery({
    queryKey: ["getActiveCertifications", "addCertificationsModal"],
    queryFn: async () => {
      try {
        return await graphqlClient.request(getActiveCertificationsQuery, {});
      } catch (error) {
        graphqlErrorToast(error);
        throw error;
      }
    },
    enabled: isCertificationsQueryEnabled,
    retry: false,
  });

  const knownRncpCodes = useMemo(
    () =>
      new Set(
        (data?.getActiveCertifications ?? []).map((certification) =>
          normalizeRncpCode(certification.codeRncp).toLowerCase(),
        ),
      ),
    [data],
  );

  const hasCodesInput = codesInput.trim().length > 0;
  const isCheckingCodes = hasCodesInput && !data && !isError;
  const parsedRncpCodes =
    hasCodesInput && data ? parseRncpCodes(codesInput) : [];
  const unknownRncpCodes = parsedRncpCodes.filter(
    (code) => !knownRncpCodes.has(code.toLowerCase()),
  );
  const matchedCertifications = parsedRncpCodes.flatMap((code) =>
    (data?.getActiveCertifications ?? []).filter(
      (certification) =>
        normalizeRncpCode(certification.codeRncp).toLowerCase() ===
        code.toLowerCase(),
    ),
  );

  let unknownCodesHint: string | undefined;
  if (isCheckingCodes) {
    unknownCodesHint = "Vérification des codes en cours.";
  } else if (isError) {
    unknownCodesHint =
      "La liste des certifications actives n'a pas pu être chargée.";
  }

  const unknownRncpCodesCountLabel = `${unknownRncpCodes.length} code(s) RNCP non référencé(s) sur ${parsedRncpCodes.length} code(s)`;

  const updateCertificationAuthorityCertifications = useMutation({
    mutationFn: ({
      certificationAuthorityId,
      certificationIds,
    }: {
      certificationAuthorityId: string;
      certificationIds: string[];
    }) =>
      graphqlClient.request(
        updateCertificationAuthorityCertificationsMutation,
        {
          certificationAuthorityId,
          certificationIds,
        },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [certificationAuthorityId],
      }),
  });

  const handleAddMatchedCertifications = async () => {
    try {
      await updateCertificationAuthorityCertifications.mutateAsync({
        certificationAuthorityId,
        certificationIds: [
          ...new Set([
            ...currentCertificationIds,
            ...matchedCertifications.map((certification) => certification.id),
          ]),
        ],
      });
      setCodesInput("");
      addCertificationsModal.close();
      successToast("Les certifications ont été ajoutées");
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  const handleCopyUnknownRncpCodes = async () => {
    try {
      await navigator.clipboard.writeText(unknownRncpCodes.join(", "));
      successToast("Codes RNCP copiés");
    } catch {
      errorToast("Les codes RNCP n'ont pas pu être copiés");
    }
  };

  return (
    <>
      <addCertificationsModal.Component
        title="Ajout de certifications"
        size="large"
        className="[&>.fr-container]:max-w-full"
        buttons={[
          {
            priority: "primary",
            children: "Valider",
            doClosesModal: false,
            onClick: handleAddMatchedCertifications,
            disabled:
              matchedCertifications.length === 0 ||
              updateCertificationAuthorityCertifications.isPending,
            nativeButtonProps: {
              "data-testid": "add-certifications-confirm-button",
            },
          },
        ]}
      >
        <p>
          Les certifications sélectionnées seront ajoutées à la liste des
          certifications gérées par ce certificateur administrateur.
        </p>
        <Input
          label="Liste des codes RNCP"
          hintText="Séparez les codes par un espace, une virgule ou un point-virgule. Le préfixe RNCP est optionnel."
          textArea
          data-testid="add-certifications-codes-input"
          nativeTextAreaProps={{
            value: codesInput,
            onChange: (event) => setCodesInput(event.target.value),
            rows: 1,
            spellCheck: false,
          }}
        />

        {hasCodesInput && (
          <div className="mt-4 flex items-center gap-4">
            <p className="mb-0" data-testid="add-certifications-unknown-codes">
              {unknownCodesHint || unknownRncpCodesCountLabel}
            </p>
            {!unknownCodesHint && unknownRncpCodes.length > 0 && (
              <Button
                priority="tertiary no outline"
                size="small"
                iconId="fr-icon-clipboard-line"
                onClick={handleCopyUnknownRncpCodes}
                nativeButtonProps={{
                  "data-testid": "add-certifications-copy-unknown-codes-button",
                }}
              >
                Copier
              </Button>
            )}
          </div>
        )}

        <p className="mt-4 mb-0" data-testid="add-certifications-unknown-codes">
          {`Code RNCP référencé(s) : ${parsedRncpCodes.length - unknownRncpCodes.length}`}
        </p>

        {matchedCertifications.length > 0 && (
          <ul
            className="mt-4 mb-0 list-none pl-0 max-h-[100px] overflow-y-auto"
            data-testid="add-certifications-matched-certifications"
          >
            {matchedCertifications.map((certification) => (
              <li key={certification.id} className="border-b py-3">
                <p className="mb-0 font-bold">
                  RNCP {normalizeRncpCode(certification.codeRncp)} :{" "}
                  {certification.label}
                </p>
              </li>
            ))}
          </ul>
        )}
      </addCertificationsModal.Component>
      <Button
        className="mr-4"
        priority="secondary"
        iconId="fr-icon-add-line"
        onClick={() => {
          setIsCertificationsQueryEnabled(true);
          addCertificationsModal.open();
        }}
        data-testid="add-certifications-button"
      >
        Ajouter des certifications
      </Button>
    </>
  );
};
