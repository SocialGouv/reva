export const AapSelectionAdvice = ({
  className = "",
}: {
  className?: string;
}) => (
  <p className={className}>
    Vous ne savez pas encore quel Architecte Accompagnateur de parcours choisir,
    prenez le temps de consulter{" "}
    <a
      className="fr-link"
      style={{ fontSize: "inherit" }}
      href="https://metabase.vae.gouv.fr/public/dashboard/1ac9acb3-2b30-4932-9fb2-8a0111123fdd"
      target="_blank"
    >
      la liste des AAP référencés sur France VAE
    </a>{" "}
    afin d'entamer votre appel d'offre.
  </p>
);
