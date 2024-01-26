import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { errorToast, successToast } from "@/components/toast/toast";
import { TreeSelectItem } from "@/components/tree-select";
import { graphql } from "@/graphql/generated";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo, useEffect } from "react";
import { useForm, useController } from "react-hook-form";
import { z } from "zod";

export const schema = z.object({
  regions: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        selected: z.boolean(),
        children: z
          .array(
            z.object({
              id: z.string(),
              label: z.string(),
              selected: z.boolean(),
            }),
          )
          .default([]),
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
    getCertifications(limit: 500) {
      rows {
        id
        label
        status
        codeRncp
      }
    }
    getRegions {
      id
      label
      departments {
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

  const regions = useMemo(
    () => getReferentialResponse?.getRegions || [],
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
    if (certificationAuthority && certifications.length && regions.length) {
      const regionItems: TreeSelectItem[] = regions.map((r) => {
        const departmentItems = r.departments.map((d) => ({
          id: d.id,
          label: d.label,
          selected: !!(certificationAuthority?.departments).find?.(
            (cad) => cad.id === d.id,
          ),
        }));
        return {
          id: r.id,
          label: r.label,
          selected: departmentItems.every((d) => d.selected),
          children: departmentItems,
        };
      });

      const certificationItems: TreeSelectItem[] = certifications
        .filter((c) => c.status === "AVAILABLE" || c.status === "INACTIVE")
        .map((c) => ({
          id: c.id,
          label: `${c.codeRncp} - ${c.label}${
            c.status === "INACTIVE" ? " (ancienne version)" : ""
          }`,
          selected: !!(certificationAuthority?.certifications).find?.(
            (cac) => cac.id === c.id,
          ),
        }));
      reset({
        certifications: certificationItems,
        regions: regionItems,
      });
    }
  }, [certifications, regions, certificationAuthority, reset]);

  const certificationsController = useController({
    name: "certifications",
    control,
  });

  const regionsAndDeparmController = useController({
    name: "regions",
    control,
  });

  const toggleRegionOrDepartment = (regionOrdepartmentId: string) => {
    const newValues = [...regionsAndDeparmController.field.value];
    const type = regions.find((r) => r.id === regionOrdepartmentId)
      ? "region"
      : "department";

    if (type === "region") {
      const regionIndex = newValues.findIndex(
        (r) => r.id === regionOrdepartmentId,
      );
      const region = newValues[regionIndex];
      region.selected = !region.selected;
      for (const dep of region.children) {
        dep.selected = region.selected;
      }
    } else {
      const regionIndex = newValues.findIndex(
        (r) => !!r.children.find((d) => d.id === regionOrdepartmentId),
      );
      const department = newValues[regionIndex].children.find(
        (d) => d.id === regionOrdepartmentId,
      );

      if (department) {
        department.selected = !department.selected;
      }
      const region = newValues[regionIndex];
      region.selected = region.children.every((d) => d.selected);
    }
    regionsAndDeparmController.field.onChange({ target: { value: newValues } });
  };

  const toggleAllRegionsAndDepartments = (selected: boolean) => {
    const newValues = [...regionsAndDeparmController.field.value];
    for (const v of newValues) {
      v.selected = selected;
      for (const dv of v.children) {
        dv.selected = selected;
      }
    }
    regionsAndDeparmController.field.onChange({ target: { value: newValues } });
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
    try {
      await updateCertificationAuthority.mutateAsync({
        certificationAuthorityId,
        departmentIds: data.regions
          .flatMap((r) => r.children)
          .filter((d) => d.selected)
          .map((d) => d.id),
        certificationIds: data.certifications
          .filter((c) => c.selected)
          .map((c) => c.id),
      });
      successToast("modifications enregistrées");
    } catch (e) {
      console.error(e);
      errorToast("Une erreur est survenue");
    }
  });

  return {
    certificationAuthority,
    regionsAndDeparmController,
    certificationsController,
    handleFormSubmit,
    toggleRegionOrDepartment,
    toggleAllRegionsAndDepartments,
    toggleCertification,
    toggleAllCertifications,
    isSubmitting,
  };
};
