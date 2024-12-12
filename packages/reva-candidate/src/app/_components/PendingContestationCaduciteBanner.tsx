import { format } from "date-fns";
import Image from "next/image";

export const PendingContestationCaduciteBanner = ({
  pendingContestationCaduciteSentAt,
}: {
  pendingContestationCaduciteSentAt: number | undefined;
}) => (
  <div
    data-test="pending-contestation-caducite-banner"
    className="static w-full my-14 border-b-[4px] border-b-[#FFA180] px-8 py-8 shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)] flex flex-col items-center text-start lg:relative lg:h-[85px] lg:flex-row"
  >
    <Image
      src="/candidat/images/image-warning-hand.png"
      width={132}
      height={153}
      alt="Main levée en signe d'avertissement"
      className="relative hidden -top-28 lg:block lg:top-0 lg:-left-9"
    />
    <div className="flex flex-col justify-center px-4 text-justify lg:mt-0 lg:p-0">
      <p className="my-0">
        Votre contestation a été faite le{" "}
        {format(pendingContestationCaduciteSentAt as number, "dd/MM/yyyy")}.
        Elle a été envoyée à votre certificateur qui y répondra dans les
        meilleurs délais.
      </p>
    </div>
  </div>
);
