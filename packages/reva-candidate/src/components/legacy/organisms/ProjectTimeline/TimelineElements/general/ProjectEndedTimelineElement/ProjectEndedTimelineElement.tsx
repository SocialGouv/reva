import Image from "next/image";

import { useCandidacy } from "@/components/candidacy/candidacy.context";

export const ProjectEndedTimelineElement = () => {
  const { candidacy } = useCandidacy();

  const { jury } = candidacy;

  const success = jury?.result?.indexOf("FULL_SUCCESS") !== -1;

  return success ? (
    <div className="mt-8 flex flex-row gap-6 p-4 max-w-[600px] shadow-[0_6px_18px_0_rgba(0,0,18,0.16)]">
      <Image width="56" height="56" src="/candidat/trophy.png" alt="Trophée" />
      <label className="text-xl font-bold">
        Félicitations, vous avez obtenu votre diplôme par la Validation des
        Acquis de l’Expérience (VAE) !
      </label>
    </div>
  ) : null;
};
