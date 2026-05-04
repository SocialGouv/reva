"use client";

import { format } from "date-fns";

import { useAuth } from "@/components/auth/auth";

import { useDropout } from "./dropout.hook";

const CandidacyDropoutPage = () => {
  const { candidacy } = useDropout();

  const { isAdmin } = useAuth();

  if (!candidacy || !candidacy.candidacyDropOut) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-dsfrBlack-500 text-4xl m-0">Abandon du candidat</h1>

      <>
        <div className="flex flex-col m-0">
          <div className="flex items-center gap-6 border-t border-b border-neutral-300 py-2 px-4 text-dsfrGray-labelGrey">
            <div>Date de la mise en abandon</div>
            <div className="font-bold flex-1 text-right">
              {format(candidacy.candidacyDropOut.createdAt, "d/MM/yyyy")}
            </div>
          </div>

          <div className="flex items-center gap-6 border-b border-neutral-300 py-2 px-4 text-dsfrGray-labelGrey">
            <div>Raison de l'abandon</div>
            <div className="font-bold flex-1 text-right">
              {candidacy.candidacyDropOut.dropOutReason.label}
            </div>
          </div>

          {isAdmin && candidacy.candidacyDropOut.validatedAt && (
            <div className="flex items-center gap-6 border-b border-neutral-300 py-2 px-4 text-dsfrGray-labelGrey">
              <div>Confirmation par France VAE</div>
              <div className="font-bold flex-1 text-right">
                {format(candidacy.candidacyDropOut.validatedAt, "d/MM/yyyy")}
              </div>
            </div>
          )}
        </div>
      </>
    </div>
  );
};

export default CandidacyDropoutPage;
