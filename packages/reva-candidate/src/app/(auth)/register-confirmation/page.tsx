import { StatusPage } from "@/app/_components/status-page/StatusPage";
import { PICTOGRAMS } from "@/components/pictograms/Pictograms";

export default function RegisterConfirmation() {
  return (
    <StatusPage
      title="Dernière étape, activez votre compte !"
      chapo={
        <>
          Votre demande de création de compte a bien été enregistrée.{" "}
          <strong>
            Pour l'activer, cliquez sur le lien contenu dans le courriel
          </strong>{" "}
          que nous venons de vous envoyer. Attention, ce lien est valable 3
          heures.
        </>
      }
      details={
        <>
          Attention, nos courriels peuvent se perdre dans votre dossier de
          courrier indésirable (spams). Si vous avez la moindre question, vous
          pouvez nous contacter à l'adresse électronique :{" "}
          <a href="mailto:support@vae.gouv.fr" className="fr-link fr-link--sm">
            support@vae.gouv.fr
          </a>
        </>
      }
      pictogram={PICTOGRAMS.mailSendLG}
      actionLink={{ href: "/", label: "Retour à la page d'accueil" }}
    />
  );
}
