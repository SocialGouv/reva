import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";

export const CertificationParcoursCard = ({
  parcoursByCertificationAuthorities,
}: {
  parcoursByCertificationAuthorities: {
    certificationAuthority: {
      id: string;
      label: string;
      websiteUrl?: string | null;
    };
    parcours: {
      id: string;
      label: string;
    }[];
  }[];
}) => {
  return (
    <EnhancedSectionCard
      title="Parcours"
      titleIconClass="fr-icon-book-2-fill"
      status="COMPLETED"
      data-testid="parcours-card"
    >
      {parcoursByCertificationAuthorities.length > 0 ? (
        parcoursByCertificationAuthorities.map((pba) => (
          <div
            key={pba.certificationAuthority.id}
            data-testid={`parcours-by-certification-authority-${pba.certificationAuthority.label}`}
          >
            {pba.certificationAuthority.websiteUrl ? (
              <a
                href={pba.certificationAuthority.websiteUrl}
                target="_blank"
                className="fr-link"
              >
                {pba.certificationAuthority.label}
              </a>
            ) : (
              <span className="text-[#000091]">
                {pba.certificationAuthority.label}
              </span>
            )}

            <ul className="ml-2 text-gray-900">
              {pba.parcours.map((p) => (
                <li key={p.id}>{p.label}</li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>Aucun parcours trouvé</p>
      )}
    </EnhancedSectionCard>
  );
};
