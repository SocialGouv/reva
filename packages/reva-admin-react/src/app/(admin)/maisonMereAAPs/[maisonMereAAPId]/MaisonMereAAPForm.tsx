import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { UpdateMaisonMereAapInput } from "@/graphql/generated/graphql";
import Button from "@codegouvfr/react-dsfr/Button";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { treeSelectItemsToSelectedDepartmentIds } from "@/utils";
import { graphql } from "@/graphql/generated";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  TreeSelect,
  TreeSelectItem,
  updateSelectedValueForAllItemsBasedOnItem,
  updateSelectedValueForAllItemsBasedOnValue,
} from "@/components/tree-select";

const adminUpdateMaisonMereAAPMutation = graphql(`
  mutation adminUpdateMaisonMereAAP(
    $maisonMereAAPId: ID!
    $data: UpdateMaisonMereAAPInput!
  ) {
    organism_adminUpdateMaisonMereAAP(
      maisonMereAAPId: $maisonMereAAPId
      maisonMereAAPData: $data
    )
  }
`);

function MaisonMereAAPForm(params: {
  maisonMereAAPId: string;
  onSiteDepartmentsOnRegions: TreeSelectItem[];
  remoteDepartmentsOnRegions: TreeSelectItem[];
}) {
  const { graphqlClient } = useGraphQlClient();

  const adminUpdateMaisonMereAAP = useMutation({
    mutationFn: (params: {
      maisonMereAAPId: string;
      data: UpdateMaisonMereAapInput;
    }) => graphqlClient.request(adminUpdateMaisonMereAAPMutation, params),
  });

  const queryClient = useQueryClient();
  const methods = useForm();

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const [onSiteDepartmentsOnRegions, setOnSiteDepartmentsOnRegions] = useState<
    TreeSelectItem[]
  >(params.onSiteDepartmentsOnRegions);

  const [remoteDepartmentsOnRegions, setRemoteDepartmentsOnRegions] = useState<
    TreeSelectItem[]
  >(params.remoteDepartmentsOnRegions);

  const handleFormSubmit = handleSubmit(async (data) => {
    const selectedOnSiteDepartmentIds = treeSelectItemsToSelectedDepartmentIds(
      onSiteDepartmentsOnRegions,
    );

    const selectedRemoteDepartmentIds = treeSelectItemsToSelectedDepartmentIds(
      remoteDepartmentsOnRegions,
    );

    const departmentsIdsSet = new Set([
      ...selectedOnSiteDepartmentIds,
      ...selectedRemoteDepartmentIds,
    ]);

    let allSelectedDepartmentsIds = Array.from(departmentsIdsSet);

    let zoneIntervention = allSelectedDepartmentsIds.map((id) => ({
      departmentId: id,
      isOnSite: selectedOnSiteDepartmentIds.includes(id),
      isRemote: selectedRemoteDepartmentIds.includes(id),
    }));

    try {
      await adminUpdateMaisonMereAAP.mutateAsync({
        maisonMereAAPId: params.maisonMereAAPId,
        data: { zoneIntervention },
      });
      await queryClient.invalidateQueries({
        queryKey: ["getMaisonMereAAP", params.maisonMereAAPId],
      });

      successToast("modifications enregistrées");
    } catch (e) {
      graphqlErrorToast(e);
    }
  });

  const onClickOnSiteDepartmentItem = (item: TreeSelectItem) => {
    const mappedDepartmentItems = updateSelectedValueForAllItemsBasedOnItem(
      onSiteDepartmentsOnRegions,
      item,
    );
    setOnSiteDepartmentsOnRegions(mappedDepartmentItems);
  };

  const onClickRemoteDepartmentItem = (item: TreeSelectItem) => {
    const mappedDepartmentItems = updateSelectedValueForAllItemsBasedOnItem(
      remoteDepartmentsOnRegions,
      item,
    );
    setRemoteDepartmentsOnRegions(mappedDepartmentItems);
  };

  const onClickSelectAllOnSiteDepartmentItems = (value: boolean) => {
    const mappedDepartmentItems = updateSelectedValueForAllItemsBasedOnValue(
      remoteDepartmentsOnRegions,
      value,
    );
    setOnSiteDepartmentsOnRegions(mappedDepartmentItems);
  };

  const onClickSelectAllRemoteDepartmentItems = (value: boolean) => {
    const mappedDepartmentItems = updateSelectedValueForAllItemsBasedOnValue(
      remoteDepartmentsOnRegions,
      value,
    );
    setRemoteDepartmentsOnRegions(mappedDepartmentItems);
  };

  return (
    <>
      <div className="w-full">
        <FormProvider {...methods}>
          <form onSubmit={handleFormSubmit}>
            <fieldset className="my-8 grid grid-cols-2 gap-x-8">
              <div>
                <legend className="text-2xl font-bold">
                  Zone d'intervention en présentiel
                </legend>

                <TreeSelect
                  title="Cochez les régions ou départements gérés"
                  label="Toute la France"
                  items={onSiteDepartmentsOnRegions}
                  onClickSelectAll={onClickSelectAllOnSiteDepartmentItems}
                  onClickItem={onClickOnSiteDepartmentItem}
                />
              </div>
              <div>
                <legend className="text-2xl font-bold">
                  Zone d'intervention en distanciel
                </legend>

                <TreeSelect
                  title="Cochez les régions ou départements gérés"
                  label="Toute la France"
                  items={remoteDepartmentsOnRegions}
                  onClickSelectAll={onClickSelectAllRemoteDepartmentItems}
                  onClickItem={onClickRemoteDepartmentItem}
                />
              </div>
            </fieldset>

            <div className="flex flex-col md:flex-row items-center md:items-end justify-between">
              <div></div>
              <div className="flex flex-col md:flex-row gap-4 self-center md:self-end mt-8 md:mt-0">
                <Button disabled={isSubmitting}>Enregistrer</Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </>
  );
}

export default MaisonMereAAPForm;
