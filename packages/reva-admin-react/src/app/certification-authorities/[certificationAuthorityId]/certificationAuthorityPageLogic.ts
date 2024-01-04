import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { successToast } from "@/components/toast/toast";
import { TreeSelectItem } from "@/components/tree-select";
import { graphql } from "@/graphql/generated";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo, useEffect } from "react";
import { useForm, useController } from "react-hook-form";
import { z } from "zod";

export const schema = z.object({
  departments: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        selected: z.boolean(),
      }),
    )
    .default([]),
  certifications: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        selected: z.boolean(),
      }),
    )
    .default([]),
});

type FormData = z.infer<typeof schema>;

const getCertificationAuthorityQuery = graphql(`
  query getCertificationAuthority($certificationAuthorityId: ID!) {
    certification_authority_getCertificationAuthority(
      id: $certificationAuthorityId
    ) {
      id
      label
      contactFullName
      contactEmail
      departments {
        id
        code
        label
      }
      certifications {
        id
        codeRncp
        label
      }
    }
  }
`);

const getReferentialQuery = graphql(`
  query getReferential {
    getDepartments {
      id
      code
      label
    }
    getCertifications(limit: 500) {
      rows {
        id
        label
      }
    }
  }
`);

const updateCertificationAuthorityMutation = graphql(`
  mutation updateCertificationAuthorityDepartmentsAndCertificationsMutation(
    $input: UpdateCertificationAuthorityDepartmentsAndCertificationsInput!
  ) {
    certification_authority_updateCertificationAuthorityDepartmentsAndCertifications(
      input: $input
    ) {
      id
    }
  }
`);

export const useCertificationAuthorityPageLogic = () => {
  const { graphqlClient } = useGraphQlClient();
  const { certificationAuthorityId } = useParams<{
    certificationAuthorityId: string;
  }>();

  const { data: getCertificationAuthorityResponse } = useQuery({
    queryKey: ["getCertificationAuthority", certificationAuthorityId],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityQuery, {
        certificationAuthorityId,
      }),
  });

  const { data: getReferentialResponse } = useQuery({
    queryKey: ["getReferential"],
    queryFn: () => graphqlClient.request(getReferentialQuery),
  });

  const updateCertificationAuthority = useMutation({
    mutationFn: (input: {
      certificationAuthorityId: string;
      certificationIds: string[];
      departmentIds: string[];
    }) =>
      graphqlClient.request(updateCertificationAuthorityMutation, {
        input,
      }),
  });

  const certificationAuthority =
    getCertificationAuthorityResponse?.certification_authority_getCertificationAuthority;

  const departments = useMemo(
    () => getReferentialResponse?.getDepartments || [],
    [getReferentialResponse],
  );
  const certifications = useMemo(
    () => getReferentialResponse?.getCertifications.rows || [],
    [getReferentialResponse],
  );

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  //reset form when ref data is loaded
  useEffect(() => {
    if (certificationAuthority && certifications.length && departments.length) {
      const departmentItems: TreeSelectItem[] = departments.map((d) => ({
        id: d.id,
        label: d.label,
        selected: !!(certificationAuthority?.departments).find?.(
          (cad) => cad.id === d.id,
        ),
      }));

      const certificationItems: TreeSelectItem[] = certifications.map((c) => ({
        id: c.id,
        label: c.label,
        selected: !!(certificationAuthority?.certifications).find?.(
          (cac) => cac.id === c.id,
        ),
      }));
      reset({
        certifications: certificationItems,
        departments: departmentItems,
      });
    }
  }, [certifications, departments, certificationAuthority, reset]);

  const certificationsController = useController({
    name: "certifications",
    control,
  });

  const departmentsController = useController({
    name: "departments",
    control,
  });

  const toggleDepartment = (departmentId: string) => {
    const newValues = [...departmentsController.field.value];
    const departmentIndex = newValues.findIndex((d) => d.id === departmentId);
    const oldDepartment = newValues[departmentIndex];
    newValues.splice(departmentIndex, 1, {
      ...oldDepartment,
      selected: !oldDepartment.selected,
    });
    departmentsController.field.onChange({ target: { value: newValues } });
  };

  const toggleAllDepartments = (selected: boolean) => {
    const newValues = [...departmentsController.field.value];
    for (const v of newValues) {
      v.selected = selected;
    }
    departmentsController.field.onChange({ target: { value: newValues } });
  };

  const toggleCertification = (certificationId: string) => {
    const newValues = [...certificationsController.field.value];
    const certificationIndex = newValues.findIndex(
      (c) => c.id === certificationId,
    );
    const oldCertification = newValues[certificationIndex];
    newValues.splice(certificationIndex, 1, {
      ...oldCertification,
      selected: !oldCertification.selected,
    });
    certificationsController.field.onChange({ target: { value: newValues } });
  };

  const toggleAllCertifications = (selected: boolean) => {
    const newValues = [...certificationsController.field.value];
    for (const v of newValues) {
      v.selected = selected;
    }
    certificationsController.field.onChange({ target: { value: newValues } });
  };

  const handleFormSubmit = handleSubmit(async (data) => {
    await updateCertificationAuthority.mutateAsync({
      certificationAuthorityId,
      departmentIds: data.departments
        .filter((d) => d.selected)
        .map((d) => d.id),
      certificationIds: data.certifications
        .filter((c) => c.selected)
        .map((c) => c.id),
    });
    successToast("modifications enregistrées");
  });

  return {
    certificationAuthority,
    departmentsController,
    certificationsController,
    handleFormSubmit,
    toggleDepartment,
    toggleAllDepartments,
    toggleCertification,
    toggleAllCertifications,
    isSubmitting,
  };
};
