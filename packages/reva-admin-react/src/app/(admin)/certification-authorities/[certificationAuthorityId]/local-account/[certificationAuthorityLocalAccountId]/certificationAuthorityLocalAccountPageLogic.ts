import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { TreeSelectItem } from "@/components/tree-select";
import { graphql } from "@/graphql/generated";
import { Department, Region } from "@/graphql/generated/graphql";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { sortBy } from "lodash";
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

const getCertificationAuthorityLocalAccountQuery = graphql(`
  query getCertificationAuthorityLocalAccount(
    $certificationAuthorityLocalAccountId: ID!
  ) {
    certification_authority_getCertificationAuthorityLocalAccount(
      id: $certificationAuthorityLocalAccountId
    ) {
      id
      account {
        email
        firstname
        lastname
      }
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
      certificationAuthority {
        id
        departments {
          id
          label
          region {
            id
            code
            label
          }
        }
        certifications {
          id
          label
          status
          codeRncp
        }
      }
    }
  }
`);

const updateCertificationAuthorityLocalAccountMutation = graphql(`
  mutation updateCertificationAuthorityLocalAccountMutation(
    $input: UpdateCertificationAuthorityLocalAccountInput!
  ) {
    certification_authority_updateCertificationAuthorityLocalAccount(
      input: $input
    ) {
      id
    }
  }
`);

export const useCertificationAuthorityLocalAccountPageLogic = () => {
  const { graphqlClient } = useGraphQlClient();
  const { certificationAuthorityLocalAccountId } = useParams<{
    certificationAuthorityLocalAccountId: string;
  }>();

  const { data: getCertificationAuthorityLocalAccountResponse } = useQuery({
    queryKey: [
      "getCertificationAuthorityLocalAccount",
      certificationAuthorityLocalAccountId,
    ],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityLocalAccountQuery, {
        certificationAuthorityLocalAccountId,
      }),
  });

  const updateCertificationAuthorityLocalAccount = useMutation({
    mutationFn: (input: {
      certificationAuthorityLocalAccountId: string;
      certificationIds: string[];
      departmentIds: string[];
    }) =>
      graphqlClient.request(updateCertificationAuthorityLocalAccountMutation, {
        input,
      }),
  });

  const certificationAuthorityLocalAccount =
    getCertificationAuthorityLocalAccountResponse?.certification_authority_getCertificationAuthorityLocalAccount;

  //get available regions from certification authority departments and put available departments into them
  const regions = useMemo(() => {
    const departments =
      certificationAuthorityLocalAccount?.certificationAuthority.departments ||
      [];
    let newRegions: Region[] = [];
    for (const d of departments) {
      let region = newRegions.find((r) => r.id === d.region.id);
      if (!region) {
        region = d.region as Region;
        region.departments = [];
        newRegions.push(region);
      }
      region.departments.push(d as Department);
    }
    for (const r of newRegions) {
      r.departments = sortBy(r.departments, (d) => d.label);
    }
    newRegions = sortBy(newRegions, (r) => r.label);
    return newRegions;
  }, [certificationAuthorityLocalAccount?.certificationAuthority.departments]);

  const certifications = useMemo(
    () =>
      certificationAuthorityLocalAccount?.certificationAuthority
        ?.certifications,
    [
      certificationAuthorityLocalAccount?.certificationAuthority
        ?.certifications,
    ],
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
    if (
      certificationAuthorityLocalAccount &&
      certifications?.length &&
      regions.length
    ) {
      const regionItems: TreeSelectItem[] = regions.map((r) => {
        const departmentItems = r.departments.map((d) => ({
          id: d.id,
          label: d.label,
          selected: !!(certificationAuthorityLocalAccount?.departments).find?.(
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
          selected:
            !!(certificationAuthorityLocalAccount?.certifications).find?.(
              (cac) => cac.id === c.id,
            ),
        }));
      reset({
        certifications: certificationItems,
        regions: regionItems,
      });
    }
  }, [certifications, regions, certificationAuthorityLocalAccount, reset]);

  const certificationsController = useController({
    name: "certifications",
    control,
  });

  const regionsAndDeparmController = useController({
    name: "regions",
    control,
  });

  const toggleRegionOrDepartment = (regionOrdepartmentId: string) => {
    const type = regions.find((r) => r.id === regionOrdepartmentId)
      ? "region"
      : "department";

    if (type === "region") {
      toggleRegion(regionOrdepartmentId);
    } else {
      toggleDepartment(regionOrdepartmentId);
    }
  };

  const toggleRegion = (regionId: string) => {
    const newValues = [...regionsAndDeparmController.field.value];
    const regionIndex = newValues.findIndex((r) => r.id === regionId);
    const region = newValues[regionIndex];
    region.selected = !region.selected;
    for (const dep of region.children) {
      dep.selected = region.selected;
    }
    regionsAndDeparmController.field.onChange({ target: { value: newValues } });
  };

  const toggleDepartment = (departmentId: string) => {
    const newValues = [...regionsAndDeparmController.field.value];
    const regionIndex = newValues.findIndex(
      (r) => !!r.children.find((d) => d.id === departmentId),
    );
    const department = newValues[regionIndex].children.find(
      (d) => d.id === departmentId,
    );

    if (department) {
      department.selected = !department.selected;
    }
    const region = newValues[regionIndex];
    region.selected = region.children.every((d) => d.selected);
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
      await updateCertificationAuthorityLocalAccount.mutateAsync({
        certificationAuthorityLocalAccountId,
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
      graphqlErrorToast(e);
    }
  });

  return {
    certificationAuthorityLocalAccount,
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
