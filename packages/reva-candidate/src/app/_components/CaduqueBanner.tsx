import Button from "@codegouvfr/react-dsfr/Button";
import Link from "next/link";
import { Banner } from "./Banner";

export const CaduqueBanner = () => (
  <div className="mt-12 flex flex-col gap-4" data-test="caduque-banner">
    <Banner
      description="Parce que vous ne vous êtes pas actualisé à temps, votre recevabilité n'est plus valable. Cela signifie que votre parcours VAE s'arrête ici. Si vous souhaitez contester cette décision, cliquez sur le bouton “Contester”."
      imageSrc="/candidat/images/image-warning-hand.png"
      imgAlt="Main levée en signe d'avertissement"
    />
    <Link href="/contestation" className="self-end">
      <Button data-test="caduque-banner-button">Contester</Button>
    </Link>
  </div>
);
