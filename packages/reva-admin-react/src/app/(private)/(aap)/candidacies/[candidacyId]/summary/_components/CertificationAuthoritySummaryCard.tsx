import { EnhancedSectionCard } from "@/components/card/enhanced-section-card/EnhancedSectionCard";

interface CertificationAuthoritySummaryCardProps {
  label?: string | null;
  localAccounts: Array<{
    contactFullName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
  }>;
  defaultContact?: {
    contactFullName?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
  } | null;
  profileHref?: string;
}

export const CertificationAuthoritySummaryCard = ({
  label,
  localAccounts,
  defaultContact,
  profileHref,
}: CertificationAuthoritySummaryCardProps) => (
  <EnhancedSectionCard
    title="Certificateur"
    {...(profileHref && {
      customButtonTitle: "Voir son profil",
      isEditable: true,
      buttonOnClickHref: profileHref,
    })}
  >
    <div className="ml-10 mr-6">
      <p className="text-xl font-bold mb-0 leading-loose">{label}</p>
      <div>
        {localAccounts.length > 0 ? (
          localAccounts.map((account, i) => (
            <p
              key={i}
              className="mb-4 [&:not(:last-child)]:border-b-2 [&:not(:last-child)]:pb-4"
              data-testid={`certification-authority-local-account-${i}`}
            >
              {account?.contactFullName} <br />
              {account?.contactEmail} <br />
              {account?.contactPhone}
            </p>
          ))
        ) : (
          <p>
            {defaultContact?.contactFullName}
            <br />
            {defaultContact?.contactEmail}
            <br />
            {defaultContact?.contactPhone}
          </p>
        )}
      </div>
    </div>
  </EnhancedSectionCard>
);
