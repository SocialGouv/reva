import { CallOut } from "@codegouvfr/react-dsfr/CallOut";
import Link from "next/link";

export const FundingCallOut = ({ className }: { className?: string }) => (
  <CallOut title="Comment financer mon parcours VAE ?" className={className}>
    Avant votre premier rendez-vous avec votre accompagnateur, découvrez tous
    les{" "}
    <Link
      target="_blank"
      className="fr-link text-lg"
      href="https://vae.gouv.fr/savoir-plus/articles/financer-son-accompagnement-vae/"
    >
      dispositifs qui financent les parcours VAE
    </Link>{" "}
    (CPF, aides régionales, France Travail, etc.) avec son soutien si besoin.
  </CallOut>
);
