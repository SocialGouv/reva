"use client";

import { useSearchParams } from "next/navigation";

import { StatusPage } from "@/app/_components/status-page/StatusPage";
import { PICTOGRAMS } from "@/components/pictograms/Pictograms";

const errorMessages: Record<string, string> = {
  access_denied:
    "L'authentification a été annulée ou refusée. Veuillez réessayer.",
  invalid_request:
    "La demande d'authentification est invalide ou a expiré. Veuillez réessayer.",
  server_error:
    "Une erreur technique est survenue. Veuillez réessayer ultérieurement.",
};

const defaultMessage = errorMessages.server_error;

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "server_error";
  const errorDescription = searchParams.get("error_description");

  const isReconciliationError = errorDescription?.includes(
    "Les informations d'identit\u00e9 ne correspondent pas",
  );

  if (isReconciliationError) {
    return (
      <StatusPage
        title="Erreur d'authentification"
        chapo={
          <>
            <p className="text-xl leading-8 mb-6">
              Une ou plusieurs des informations suivantes ne correspond(ent) pas
              au compte existant avec la même adresse électronique :
            </p>
            <ul className="text-xl leading-8 list-disc mb-6 pl-8">
              <li>Nom de naissance</li>
              <li>Prénom principal</li>
              <li>Date de naissance</li>
            </ul>
            <p className="text-xl leading-8 mb-0">
              Connectez-vous avec vos identifiants habituels pour vérifier ces
              informations.
            </p>
          </>
        }
        details={
          <p className="text-sm leading-6 mb-0">
            Le problème persiste alors que vos informations sont identiques
            entre vos comptes FranceConnect et France VAE ?{" "}
            <a href="mailto:support@vae.gouv.fr">Contacter le support</a> afin
            de comprendre d&apos;où peut venir le problème.
          </p>
        }
        actionLink={{
          href: "/login",
          label: "Revenir à la page d'accueil",
          priority: "primary",
        }}
        pictogram={PICTOGRAMS.errorLG}
      />
    );
  }

  const displayMessage =
    errorDescription || errorMessages[error] || defaultMessage;

  return (
    <StatusPage
      title="Erreur d'authentification"
      chapo={displayMessage}
      actionLink={{
        href: "/login",
        label: "Revenir à la page d'accueil",
        priority: "primary",
      }}
      pictogram={PICTOGRAMS.errorLG}
    />
  );
}
