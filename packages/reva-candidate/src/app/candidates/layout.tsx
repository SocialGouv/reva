"use client";

import { useParams, usePathname } from "next/navigation";

export default function CandidatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { candidateId, candidacyId } = useParams<{
    candidateId?: string;
    candidacyId?: string;
  }>();

  const isTransparentPath =
    pathname === `/candidates/` ||
    pathname === `/candidates/${candidateId}/` ||
    pathname === `/candidates/${candidateId}/first-connexion/` ||
    pathname === `/candidates/${candidateId}/candidacies/` ||
    pathname === `/candidates/${candidateId}/candidacies/${candidacyId}/` ||
    pathname === `/candidates/${candidateId}/candidacies/create/` ||
    pathname.endsWith(`type-accompagnement/`) ||
    pathname.startsWith(
      `/candidates/${candidateId}/candidacies/create/vae-collective/`,
    );

  return (
    <div className="flex flex-col flex-1 lg:bg-candidate">
      <div className="flex flex-col flex-1">
        {isTransparentPath ? (
          <div className="fr-container flex-1 md:mt-4 pt-4 md:pt-8 md:pb-8 fr-grid-row mb-12">
            {children}
          </div>
        ) : (
          <div className="fr-container md:mt-8 pt-4 md:pt-4 md:pb-4 fr-grid-row mb-12 bg-white lg:shadow-lifted">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
