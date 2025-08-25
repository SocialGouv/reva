export const AapSelectionAdvice = ({
  className = "",
}: {
  className?: string;
}) => (
  <p className={className}>
    Vous n’avez pas encore identifié d’Architecte Accompagnateur de Parcours ?
    Nous vous invitons à consulter{" "}
    <a
      className="fr-link"
      style={{ fontSize: "inherit" }}
      href="https://metabase.vae.gouv.fr/public/dashboard/1ac9acb3-2b30-4932-9fb2-8a0111123fdd"
      target="_blank"
    >
      la liste des AAP référencés sur France VAE
    </a>
  </p>
);
