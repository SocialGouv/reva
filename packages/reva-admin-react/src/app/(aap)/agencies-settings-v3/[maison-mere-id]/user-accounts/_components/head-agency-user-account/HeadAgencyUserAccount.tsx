"use client";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useUpdateUserAccountPage } from "./updateUserAccount.hook";
import { UserAccountForm, UserAccountFormData } from "./UserAccountForm";

const HeadAgencyUserAccount = () => {
  const { userAccountId } = useParams<{ userAccountId: string }>();
  const router = useRouter();
  const {
    userAccount,
    headAgency,
    nonHeadAgencies,
    agenciesInfoIsSuccess,
    updateUserAccount,
    isAdmin,
    maisonMereAAPId,
  } = useUpdateUserAccountPage({ userAccountId });

  const backUrl = isAdmin
    ? `/maison-mere-aap/${maisonMereAAPId}`
    : `/agencies-settings-v3`;

  const handleFormSubmit = async (data: UserAccountFormData) => {
    try {
      await updateUserAccount.mutateAsync({
        accountId: userAccountId,
        accountEmail: data.email,
        accountFirstname: data.firstname,
        accountLastname: data.lastname,
        organismId: data.organismId,
      });
      successToast("Modification enregistrées");
      router.push(backUrl);
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  const defaultValues = useMemo(
    () => ({
      email: userAccount?.email || "",
      firstname: userAccount?.firstname || "",
      lastname: userAccount?.lastname || "",
      organismId: userAccount?.organism?.id,
      modalitesAccompagnement: userAccount?.organism?.isHeadAgency
        ? ("REMOTE" as const)
        : ("ONSITE" as const),
    }),
    [
      userAccount?.email,
      userAccount?.firstname,
      userAccount?.lastname,
      userAccount?.organism?.id,
      userAccount?.organism?.isHeadAgency,
    ],
  );

  if (!agenciesInfoIsSuccess) {
    return null;
  }

  return (
    <div className="w-full flex flex-col">
      <h1 className="mb-12">
        {userAccount?.firstname} {userAccount?.lastname}
      </h1>
      <FormOptionalFieldsDisclaimer />
      <UserAccountForm
        onSubmit={handleFormSubmit}
        defaultValues={defaultValues}
        remoteAgency={{
          id: headAgency?.id,
          label:
            headAgency?.informationsCommerciales?.nom ||
            headAgency?.label ||
            "",
        }}
        onSiteAgencies={nonHeadAgencies.map((a) => ({
          id: a.id,
          label: a.informationsCommerciales?.nom || a.label,
        }))}
        backUrl={backUrl}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default HeadAgencyUserAccount;
