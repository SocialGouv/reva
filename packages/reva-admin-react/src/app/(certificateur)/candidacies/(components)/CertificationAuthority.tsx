import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

const getCertificationAuthorityRaisonSocialeAdminQuery = graphql(`
  query getCertificationAuthorityRaisonSocialeAdminQuery(
    $certificationAuthorityId: ID!
  ) {
    certification_authority_getCertificationAuthority(
      id: $certificationAuthorityId
    ) {
      id
      label
    }
  }
`);

export const useCertificationAuthority = ({
  certificationAuthorityId,
}: {
  certificationAuthorityId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();

  const { data: certificationAuthorityData } = useQuery({
    queryKey: [certificationAuthorityId, "certificationAuthority"],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityRaisonSocialeAdminQuery, {
        certificationAuthorityId,
      }),
  });

  return {
    certificationAuthority:
      certificationAuthorityData?.certification_authority_getCertificationAuthority,
  };
};

interface Props {
  certificationAuthorityId: string;
}

export const CertificationAuthority = (props: Props): React.ReactNode => {
  const { certificationAuthorityId } = props;

  const { certificationAuthority } = useCertificationAuthority({
    certificationAuthorityId,
  });

  if (!certificationAuthority) return null;

  return (
    <div className="flex gap-2">
      <span className="fr-icon-home-4-fill" aria-hidden="true"></span>
      <strong className="text-xl">{certificationAuthority.label}</strong>
    </div>
  );
};
