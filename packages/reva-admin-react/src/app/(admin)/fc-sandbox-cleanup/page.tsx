"use client";

import { Alert } from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { notFound } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/auth/auth";
import { useKeycloakContext } from "@/components/auth/keycloakContext";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import {
  graphqlErrorToast,
  successToast,
  warningToast,
} from "@/components/toast/toast";

import { useFcSandboxCleanup } from "./fcSandboxCleanup.hook";

// Garde d'environnement pour la page de nettoyage des comptes sandbox FranceConnect.
// Retourne false en SSR et dès que l'hôte se termine par ".gouv.fr"
// afin de masquer la page en production.
const isSandboxCleanupHostAllowed = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const hostname = window.location.hostname.toLowerCase();
  return !hostname.endsWith(".gouv.fr");
};

// Modale unique dont le contenu est rendu dynamiquement selon l'action en cours
// (suppression d'un seul compte ou de tous les comptes affichés).
const confirmationModal = createModal({
  id: "fc-sandbox-cleanup-confirmation-modal",
  isOpenedByDefault: false,
});

const FcSandboxCleanupPage = () => {
  const { status: featureFlippingStatus, isFeatureActive } =
    useFeatureflipping();
  const { authenticated } = useKeycloakContext();
  const { isAdmin } = useAuth();

  // On attend que les deux sources (auth + feature flipping) soient prêtes avant
  // de décider de l'affichage : évite l'aller-retour "loading -> 404" pendant l'hydratation.
  const isReady = featureFlippingStatus === "INITIALIZED" && authenticated;

  const hostAllowed = isSandboxCleanupHostAllowed();
  const featureActive = isFeatureActive("FRANCE_CONNECT_SANDBOX_CLEANUP");

  const {
    candidates,
    candidatesStatus,
    candidatesIsFetching,
    deleteSandboxCandidates,
  } = useFcSandboxCleanup({
    enabled: isReady && hostAllowed && featureActive && isAdmin,
  });

  const [pendingAction, setPendingAction] = useState<
    | { kind: "single"; emails: string[] }
    | { kind: "bulk"; emails: string[] }
    | null
  >(null);

  if (!isReady) {
    // État d'attente volontairement invisible pour ne pas révéler l'existence de la page.
    return null;
  }

  if (!hostAllowed || !featureActive || !isAdmin) {
    notFound();
  }

  const openSingleDeleteModal = (email: string) => {
    setPendingAction({ kind: "single", emails: [email] });
    confirmationModal.open();
  };

  const openBulkDeleteModal = () => {
    if (candidates.length === 0) {
      return;
    }
    setPendingAction({
      kind: "bulk",
      emails: candidates.map((c) => c.email),
    });
    confirmationModal.open();
  };

  const handleConfirmDelete = async () => {
    if (!pendingAction) {
      return;
    }

    const requestedCount = pendingAction.emails.length;

    try {
      const response = await deleteSandboxCandidates.mutateAsync(
        pendingAction.emails,
      );
      const deletedCount =
        response.candidate_deleteFranceConnectSandboxCandidates ?? 0;

      if (deletedCount < requestedCount) {
        warningToast(
          `${deletedCount} compte(s) supprimé(s) sur ${requestedCount} demandé(s). Certaines suppressions ont échoué.`,
        );
      } else {
        successToast(
          `${deletedCount} compte(s) sandbox FranceConnect supprimé(s).`,
        );
      }
    } catch (error) {
      graphqlErrorToast(error);
    } finally {
      setPendingAction(null);
      confirmationModal.close();
    }
  };

  const isMutating = deleteSandboxCandidates.isPending;
  const isListLoading = candidatesStatus === "pending" || candidatesIsFetching;

  const modalDescription = (() => {
    if (!pendingAction) {
      return "";
    }
    if (pendingAction.kind === "single") {
      return `Vous êtes sur le point de supprimer définitivement le compte sandbox FranceConnect "${pendingAction.emails[0]}". Cette action est irréversible.`;
    }
    return `Vous êtes sur le point de supprimer définitivement ${pendingAction.emails.length} compte(s) sandbox FranceConnect. Cette action est irréversible.`;
  })();

  return (
    <div className="flex flex-col flex-1">
      <h1>Nettoyage comptes sandbox FranceConnect</h1>

      <Alert
        className="mb-8"
        severity="warning"
        title="Action irréversible"
        description="Ne supprime que les comptes de test sandbox FranceConnect (base + Keycloak)."
      />

      <confirmationModal.Component
        title="Confirmer la suppression"
        buttons={[
          {
            children: "Annuler",
            disabled: isMutating,
          },
          {
            onClick: handleConfirmDelete,
            children: "Supprimer",
            disabled: isMutating,
          },
        ]}
      >
        <p>{modalDescription}</p>
      </confirmationModal.Component>

      <div className="flex justify-end mb-4">
        <Button
          priority="primary"
          disabled={candidates.length === 0 || isMutating || isListLoading}
          onClick={openBulkDeleteModal}
        >
          Supprimer TOUS les comptes affichés
        </Button>
      </div>

      {isListLoading && <p>Chargement...</p>}

      {!isListLoading && candidates.length === 0 && (
        <p>Aucun compte sandbox trouvé dans la base.</p>
      )}

      {!isListLoading && candidates.length > 0 && (
        <div className="fr-table fr-table--bordered">
          <table>
            <thead>
              <tr>
                <th scope="col">Email</th>
                <th scope="col">Prénom</th>
                <th scope="col">Nom</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td>{candidate.email}</td>
                  <td>{candidate.firstname ?? ""}</td>
                  <td>{candidate.lastname ?? ""}</td>
                  <td>
                    <Button
                      priority="secondary"
                      size="small"
                      disabled={isMutating}
                      onClick={() => openSingleDeleteModal(candidate.email)}
                    >
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FcSandboxCleanupPage;
