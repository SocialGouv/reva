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
      href={`${process.env.NEXT_PUBLIC_METABASE_BASE_URL}/public/question/edc0faa3-08b0-492f-b58a-e97c8ecf1301`}
      target="_blank"
    >
      la liste des AAP référencés sur France VAE
    </a>
  </p>
);
