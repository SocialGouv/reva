import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { graphql } from "@/graphql/generated";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sortBy } from "lodash";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useController, useForm } from "react-hook-form";
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
});

type FormData = z.infer<typeof schema>;

const getCertificationAuthorityQuery = graphql(`
  query getCertificationAuthorityForAdmin($certificationAuthorityId: ID!) {
    certification_authority_getCertificationAuthority(
      id: $certificationAuthorityId
    ) {
      id
      label
      contactFullName
      contactEmail
      certificationAuthorityStructure {
        label
      }
      departments {
        id
        code
        label
      }
    }
  }
`);

const getReferentialQuery = graphql(`
  query getReferentialForAdmin {
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
  mutation updateCertificationAuthorityDepartmentsMutation(
    $certificationAuthorityId: ID!
    $departmentIds: [String!]!
  ) {
    certification_authority_updateCertificationAuthorityDepartments(
      certificationAuthorityId: $certificationAuthorityId
      departmentIds: $departmentIds
    ) {
      id
    }
  }
`);

export const useCertificationAuthority = () => {
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

  const certificationAuthority =
    getCertificationAuthorityResponse?.certification_authority_getCertificationAuthority;

  const regions = useMemo(
    () => sortBy(getReferentialResponse?.getRegions || [], (r) => r.label),
    [getReferentialResponse],
  );

  return {
    certificationAuthority,
    regions,
  };
};

export const useInterventionAreaFormLogic = ({
  certificationAuthority,
  regions,
}: {
  certificationAuthority: NonNullable<
    ReturnType<typeof useCertificationAuthority>["certificationAuthority"]
  >;
  regions: NonNullable<ReturnType<typeof useCertificationAuthority>["regions"]>;
}) => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const certificationAuthorityId = certificationAuthority?.id;
  const regionItems: FormData["regions"] = useMemo(
    () =>
      regions?.map((r) => {
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
      }),
    [regions, certificationAuthority?.departments],
  );

  const updateCertificationAuthority = useMutation({
    mutationFn: (input: {
      certificationAuthorityId: string;
      departmentIds: string[];
    }) =>
      graphqlClient.request(updateCertificationAuthorityMutation, {
        ...input,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["getCertificationAuthority", certificationAuthorityId],
      }),
  });

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      regions: regionItems,
    },
  });
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = methods;

  const regionsAndDeparmController = useController({
    name: "regions",
    control,
    defaultValue: regionItems,
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

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await updateCertificationAuthority.mutateAsync({
        certificationAuthorityId,
        departmentIds: data.regions
          .flatMap((r) => r.children)
          .filter((d) => d.selected)
          .map((d) => d.id),
      });
      successToast("Modifications enregistrées");
    } catch (e) {
      graphqlErrorToast(e);
    }
  });

  return {
    regionsAndDeparmController,
    handleFormSubmit,
    toggleRegionOrDepartment,
    toggleAllRegionsAndDepartments,
    isSubmitting,
    isDirty,
  };
};
