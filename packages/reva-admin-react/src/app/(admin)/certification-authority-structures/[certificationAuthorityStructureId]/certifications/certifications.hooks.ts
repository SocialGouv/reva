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

const getCertificationAuthorityStructureAndCertificationsQuery = graphql(`
  query getCertificationAuthorityStructureForAdminCertificationsPage($id: ID!) {
    certification_authority_getCertificationAuthorityStructure(id: $id) {
      id
      label
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

const updateCertificationAuthorityStructureCertificationsMutation = graphql(`
  mutation updateCertificationAuthorityStructureForAdminCertificationsPage(
    $certificationAuthorityStructureId: ID!
    $certificationIds: [String!]!
  ) {
    certification_authority_updateCertificationAuthorityStructureCertifications(
      certificationAuthorityStructureId: $certificationAuthorityStructureId
      certificationIds: $certificationIds
    ) {
      id
    }
  }
`);

export const useCertificationsPage = ({
  certificationAuthorityStructureId,
}: {
  certificationAuthorityStructureId: string;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const {
    data: getCertificationAuthorityStructureAndCertificationsResponse,
  } = useSuspenseQuery({
    queryKey: [
      "getCertificationAuthorityStructure",
      certificationAuthorityStructureId,
    ],
    queryFn: () =>
      graphqlClient.request(
        getCertificationAuthorityStructureAndCertificationsQuery,
        {
          id: certificationAuthorityStructureId,
        },
      ),
  });

  const updateCertificationAuthorityStructureCertifications = useMutation({
    mutationFn: ({
      certificationAuthorityStructureId,
      certificationIds,
    }: {
      certificationAuthorityStructureId: string;
      certificationIds: string[];
    }) =>
      graphqlClient.request(
        updateCertificationAuthorityStructureCertificationsMutation,
        {
          certificationAuthorityStructureId,
          certificationIds,
        },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [
          "getCertificationAuthorityStructure",
          certificationAuthorityStructureId,
        ],
      }),
  });

  const certificationAuthorityStructure =
    getCertificationAuthorityStructureAndCertificationsResponse?.certification_authority_getCertificationAuthorityStructure;

  const certifications = useMemo(
    () =>
      getCertificationAuthorityStructureAndCertificationsResponse?.searchCertificationsForAdmin?.rows.map(
        (c) => ({
          id: c.id,
          label: `${c.codeRncp} - ${c.label}`,
          selected:
            certificationAuthorityStructure?.certifications.some(
              (cert) => cert.id === c.id,
            ) || false,
        }),
      ),
    [
      certificationAuthorityStructure?.certifications,
      getCertificationAuthorityStructureAndCertificationsResponse
        ?.searchCertificationsForAdmin?.rows,
    ],
  );

  return {
    certificationAuthorityStructure,
    certifications,
    updateCertificationAuthorityStructureCertifications,
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
