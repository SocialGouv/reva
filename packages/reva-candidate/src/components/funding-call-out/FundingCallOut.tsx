import { CallOut } from "@codegouvfr/react-dsfr/CallOut";
import Link from "next/link";

export const FundingCallOut = ({ className }: { className?: string }) => (
  <CallOut title="Comment financer mon parcours VAE ?" className={className}>
    Renseignez-vous dès à présent sur les dispositifs vous permettant de{" "}
    <Link
      target="_blank"
      className="fr-link text-lg"
      href="https://vae.gouv.fr/savoir-plus/articles/financer-son-accompagnement-vae/"
    >
      financer votre parcours VAE
    </Link>
    .
  </CallOut>
);
