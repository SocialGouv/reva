import Button from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";
import Link from "next/link";

export const CaduqueBanner = () => (
  <div className="mt-12 flex flex-col gap-4" data-test="caduque-banner">
    <div className="static w-full border-b-[4px] border-b-[#FFA180] px-8 py-8 shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)] flex flex-col items-center text-start lg:relative lg:h-[85px] lg:flex-row">
      <Image
        src="/candidat/images/image-warning-hand.png"
        width={132}
        height={153}
        alt="Main levée en signe d'avertissement"
        className="relative hidden -top-28 lg:block lg:top-0 lg:-left-9"
      />
      <div className="flex flex-col justify-center px-4 text-justify lg:mt-0 lg:p-0">
        <p className="my-0">
          Parce que vous ne vous êtes pas actualisé à temps, votre recevabilité
          n'est plus valable. Cela signifie que votre parcours VAE s'arrête ici.
          Si vous souhaitez contester cette décision, cliquez sur le bouton
          “Contester”.
        </p>
      </div>
    </div>
    <Link href="/contestation" className="self-end">
      <Button data-test="caduque-banner-button">Contester</Button>
    </Link>
  </div>
);
