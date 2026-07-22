"use client";

import Link from "next/link";
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
              Un compte existe déjà avec la même adresse électronique.
              <br />
              Cependant, une ou plusieurs des informations suivantes ne
              correspond(ent) pas entre le compte existant et votre identité
              FranceConnect :
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
          <>
            <p className="text-sm leading-6">
              <strong>
                Vous rencontrez des problèmes pour vous connecter ?
              </strong>{" "}
              Consultez le{" "}
              <Link
                className="fr-link"
                href="https://scribehow.com/viewer/Parcours_du_candidat_accompagne__vp9k4YzATvmheao9kAoKjw"
                target="_blank"
              >
                guide pas à pas
              </Link>{" "}
            </p>
            <p className="text-sm leading-6 mb-0">
              Le problème persiste alors que vos informations sont identiques
              entre vos comptes FranceConnect et France VAE ?{" "}
              <Link
                className="fr-link"
                href="https://francevae.crisp.help/fr/?contact"
                target="_blank"
              >
                Contactez le support
              </Link>{" "}
              afin de comprendre d&apos;où peut venir le problème.
            </p>
          </>
        }
        actionLink={{
          href: "/login",
          label: "Revenir à la page d'acceuil",
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
      title="Problème lors de la connexion"
      chapo={displayMessage}
      actionLink={{
        href: "/login",
        label: "Revenir à la page d'acceuil",
        priority: "primary",
      }}
      pictogram={PICTOGRAMS.errorLG}
    />
  );
}
