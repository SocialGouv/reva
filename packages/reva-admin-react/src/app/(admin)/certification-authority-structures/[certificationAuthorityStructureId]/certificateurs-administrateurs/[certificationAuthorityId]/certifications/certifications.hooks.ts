import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { graphql } from "@/graphql/generated";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { useMemo } from "react";
import { useController, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const getCertificationAuthorityAndCertificationsQuery = graphql(`
  query getCertificationAuthorityForAdminCertificationsPage($id: ID!) {
    certification_authority_getCertificationAuthority(id: $id) {
      id
      label
      certificationAuthorityStructure {
        label
      }
      certifications {
        id
        codeRncp
        label
      }
    }
    searchCertificationsForAdmin(limit: 500, offset: 0) {
      rows {
        id
        codeRncp
        label
      }
    }
  }
`);

const updateCertificationAuthorityCertificationsMutation = graphql(`
  mutation updateCertificationAuthorityForAdminCertificationsPage(
    $certificationAuthorityId: ID!
    $certificationIds: [String!]!
  ) {
    certification_authority_updateCertificationAuthorityCertifications(
      certificationAuthorityId: $certificationAuthorityId
      certificationIds: $certificationIds
    ) {
      id
    }
  }
`);

export const useCertificationsPage = ({
  certificationAuthorityId,
}: {
  certificationAuthorityId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const {
    data: getCertificationAuthorityAndCertificationsResponse,
  } = useSuspenseQuery({
    queryKey: ["getCertificationAuthority", certificationAuthorityId],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityAndCertificationsQuery, {
        id: certificationAuthorityId,
      }),
  });

  const updateCertificationAuthorityCertifications = useMutation({
    mutationFn: ({
      certificationAuthorityId,
      certificationIds,
    }: {
      certificationAuthorityId: string;
      certificationIds: string[];
    }) =>
      graphqlClient.request(
        updateCertificationAuthorityCertificationsMutation,
        {
          certificationAuthorityId,
          certificationIds,
        },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["getCertificationAuthority", certificationAuthorityId],
      }),
  });

  const certificationAuthority =
    getCertificationAuthorityAndCertificationsResponse?.certification_authority_getCertificationAuthority;

  const certifications = useMemo(
    () =>
      getCertificationAuthorityAndCertificationsResponse?.searchCertificationsForAdmin?.rows.map(
        (c) => ({
          id: c.id,
          label: `${c.codeRncp} - ${c.label}`,
          selected:
            certificationAuthority?.certifications.some(
              (cert) => cert.id === c.id,
            ) || false,
        }),
      ),
    [
      certificationAuthority?.certifications,
      getCertificationAuthorityAndCertificationsResponse
        ?.searchCertificationsForAdmin?.rows,
    ],
  );

  return {
    certificationAuthority,
    certifications,
    updateCertificationAuthorityCertifications,
  };
};

const schema = z.object({
  certifications: z
    .object({ id: z.string(), label: z.string(), selected: z.boolean() })
    .array(),
});

type FormData = z.infer<typeof schema>;

export const useCertificationsForm = ({
  certifications,
}: {
  certifications: { id: string; label: string; selected: boolean }[];
}) => {
  const {
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      certifications,
    },
  });

  const certificationsController = useController({
    name: "certifications",
    control,
    defaultValue: certifications,
  });

  const toggleCertification = (certificationId: string) => {
    const newValues = [...certificationsController.field.value];
    const certificationIndex = newValues.findIndex(
      (c) => c.id === certificationId,
    );
    const certification = newValues[certificationIndex];
    certification.selected = !certification.selected;
    setValue("certifications", newValues, { shouldDirty: true });
  };

  const toggleAllCertifications = (selected: boolean) => {
    const newValues = [...certificationsController.field.value];
    for (const v of newValues) {
      v.selected = selected;
    }
    setValue("certifications", newValues, { shouldDirty: true });
  };

  return {
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
    certificationsController,
    toggleCertification,
    toggleAllCertifications,
  };
};
