import { errorToast } from "@/components/toast/toast";
import { Certification, Department } from "@/graphql/generated/graphql";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useCertificationAuthorityQueries } from "../../certificationAuthorityQueries";
import {
  LocalAccountFormData,
  LocalAccountFormSchema,
} from "./FormLocalAccount.schema";
import {
  TreeSelect,
  TreeSelectItem,
  updateSelectedValueForAllItemsBasedOnItem,
  updateSelectedValueForAllItemsBasedOnValue,
} from "@/components/tree-select";

export type LocalAccount = {
  id?: string;
  accountEmail: string;
  accountFirstname: string;
  accountLastname: string;
  certificationIds: string[];
  departmentIds: string[];
};

interface Props {
  localAccount?: LocalAccount;
  onSubmit: (data: LocalAccount) => Promise<void>;
  buttonValidateText: string;
}

export const FormLocalAccount = (props: Props): JSX.Element => {
  const { localAccount, onSubmit, buttonValidateText } = props;

  const isEditing = !!localAccount;

  const { certifictionAuthority } = useCertificationAuthorityQueries();

  const methods = useForm<LocalAccountFormData>({
    resolver: zodResolver(LocalAccountFormSchema),
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  const handleFormSubmit = handleSubmit(async (data) => {
    const selectedDepartmentIds = departmentItems.reduce((acc, region) => {
      const ids = (region.children || []).reduce((acc, department) => {
        if (department.selected) {
          return [...acc, department.id];
        }

        return acc;
      }, [] as string[]);

      return [...acc, ...ids];
    }, [] as string[]);

    if (!selectedDepartmentIds.length) {
      errorToast("Veuillez sélectionner au moins un département");
      return;
    }

    const selectedCertificationIds = certificationItems.reduce(
      (acc, certification) => {
        if (certification.selected) {
          return [...acc, certification.id];
        }

        return acc;
      },
      [] as string[],
    );

    if (!selectedCertificationIds.length) {
      errorToast("Veuillez sélectionner au moins une certification");
      return;
    }

    await onSubmit({
      id: localAccount?.id,
      accountFirstname: data.firstname,
      accountLastname: data.lastname,
      accountEmail: data.email,
      departmentIds: selectedDepartmentIds,
      certificationIds: selectedCertificationIds,
    });
  });

  const handleReset = useCallback(() => {
    reset({
      firstname: localAccount?.accountFirstname ?? "",
      lastname: localAccount?.accountLastname ?? "",
      email: localAccount?.accountEmail ?? "",
    });

    let selectedDerpartmentItems = getDefaultItemsFromDepartments(
      certifictionAuthority?.departments || [],
    );
    for (const id of localAccount?.departmentIds || []) {
      selectedDerpartmentItems = updateSelectedValueForAllItemsBasedOnItem(
        selectedDerpartmentItems,
        { id, label: "", selected: true },
      );
    }

    setDepartmentItems(selectedDerpartmentItems);

    let selectedCertificationItems = getDefaultItemsCertifications(
      certifictionAuthority?.certifications || [],
    );
    for (const id of localAccount?.certificationIds || []) {
      selectedCertificationItems = updateSelectedValueForAllItemsBasedOnItem(
        selectedCertificationItems,
        { id, label: "", selected: true },
      );
    }

    setCertificationItems(selectedCertificationItems);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certifictionAuthority, reset]);

  useEffect(() => {
    handleReset();
  }, [certifictionAuthority, reset, handleReset]);

  const [departmentItems, setDepartmentItems] = useState<TreeSelectItem[]>([]);
  const [certificationItems, setCertificationItems] = useState<
    TreeSelectItem[]
  >([]);

  const onClickDepartmentItem = (item: TreeSelectItem) => {
    const mappedDepartmentItems = updateSelectedValueForAllItemsBasedOnItem(
      departmentItems,
      item,
    );

    setDepartmentItems(mappedDepartmentItems);
  };

  const onClickSelectAllDepartmentItems = (value: boolean) => {
    const mappedDepartmentItems = updateSelectedValueForAllItemsBasedOnValue(
      departmentItems,
      value,
    );

    setDepartmentItems(mappedDepartmentItems);
  };

  const onClickCertificationItem = (item: TreeSelectItem) => {
    const mappedCertificationItems = updateSelectedValueForAllItemsBasedOnItem(
      certificationItems,
      item,
    );

    setCertificationItems(mappedCertificationItems);
  };

  const onClickSelectAllCertificationItems = (value: boolean) => {
    const mappedCertificationItems = updateSelectedValueForAllItemsBasedOnValue(
      certificationItems,
      value,
    );

    setCertificationItems(mappedCertificationItems);
  };

  return (
    <div className="w-full">
      <FormProvider {...methods}>
        <form
          onSubmit={handleFormSubmit}
          onReset={(e) => {
            e.preventDefault();

            handleReset();
          }}
        >
          <fieldset className="flex flex-col gap-4 w-full">
            <legend className="text-2xl font-bold mb-4">
              Gestion des comptes locaux
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
              <Input
                label="Nom (de la personne ou du compte)"
                state={errors.lastname ? "error" : "default"}
                stateRelatedMessage={errors.lastname?.message}
                disabled={isEditing}
                nativeInputProps={{
                  ...register("lastname"),
                  autoComplete: "family-name",
                }}
              />
              <Input
                label="Prénom (optionnel)"
                state={errors.firstname ? "error" : "default"}
                stateRelatedMessage={errors.firstname?.message}
                disabled={isEditing}
                nativeInputProps={{
                  ...register("firstname"),
                  autoComplete: "given-name",
                }}
              />
              <Input
                label="Email"
                state={errors.email ? "error" : "default"}
                stateRelatedMessage={errors.email?.message}
                disabled={isEditing}
                nativeInputProps={{
                  ...register("email"),
                  autoComplete: "email",
                  type: "email",
                  spellCheck: "false",
                }}
              />
            </div>
          </fieldset>

          <fieldset className="mt-3 grid grid-cols-2 gap-x-8">
            <div className="flex flex-col gap-y-4 sm:gap-x-8">
              <legend className="text-2xl font-bold">
                Zone d'intervention
              </legend>

              <TreeSelect
                title="Cochez les régions ou départements gérés"
                label="Toute la France Métropolitaine"
                items={departmentItems}
                onClickSelectAll={onClickSelectAllDepartmentItems}
                onClickItem={onClickDepartmentItem}
              />
            </div>

            <div className="flex flex-col gap-y-4 sm:gap-x-8">
              <legend className="text-2xl font-bold">
                Certifications gérées
              </legend>

              <TreeSelect
                title="Cochez les certifications gérées"
                label="Toutes les certifications"
                items={certificationItems}
                onClickSelectAll={onClickSelectAllCertificationItems}
                onClickItem={onClickCertificationItem}
              />
            </div>
          </fieldset>

          <div className="flex flex-col md:flex-row items-center md:items-end justify-between mt-10">
            <div></div>
            <div className="flex flex-col md:flex-row gap-4 self-center md:self-end mt-8 md:mt-0">
              <Button priority="secondary" type="reset">
                Annuler les modifications
              </Button>
              <Button disabled={isSubmitting}>{buttonValidateText}</Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

function getDefaultItemsFromDepartments(
  departments: Department[],
): TreeSelectItem[] {
  const items: TreeSelectItem[] = departments.reduce((acc, department) => {
    const { region } = department;

    const regionItemIndex = acc.findIndex((item) => item.id == region.id);
    const regionItem: TreeSelectItem =
      regionItemIndex != -1
        ? acc[regionItemIndex]
        : {
            id: region.id,
            label: region.label,
            selected: false,
            children: [],
          };

    regionItem.children?.push({
      id: department.id,
      label: department.label,
      selected: false,
    });

    if (regionItemIndex != -1) {
      return acc.splice(regionItemIndex, 1, regionItem);
    }

    return [...acc, regionItem];
  }, [] as TreeSelectItem[]);

  return items;
}

function getDefaultItemsCertifications(
  certifications: Certification[],
): TreeSelectItem[] {
  const items: TreeSelectItem[] = certifications.map((certification) => ({
    id: certification.id,
    label: certification.label,
    selected: false,
  }));

  return items;
}
