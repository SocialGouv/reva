import { GRAPHQL_API_URL } from "@/config/config";
import request, { gql } from "graphql-request";
import { useRouter } from "next/router";
import { useCallback, useContext, useState } from "react";
import { createContext, ReactNode } from "react";

type LegalStatus = "EI" | "EURL" | "SARL" | "SAS" | "SASU" | "SA";

interface ProfessionalSpaceInfo {
  companySiret: string;
  companyLegalStatus: LegalStatus;
  companyName: string;
  companyAddress: string;
  companyZipCode: string;
  companyCity: string;
  companyBillingContactFirstname: string;
  companyBillingContactLastname: string;
  companyBillingEmail: string;
  companyBillingPhoneNumber: string;
  companyBic: string;
  companyIban: string;
  accountFirstname: string;
  accountLastname: string;
  accountEmail: string;
  accountPhoneNumber: string;
  companyWebsite: string;
  typology: "generaliste" | "expertFiliere" | "expertBranche";
  domaineIds: string[];
  qualiopiCertificateExpiresAt: Date;
  qualiopiSwornStatement: boolean;
}

interface ProfessionalSpaceCreationState {
  currentStep:
    | "qualiopiCertificateInfoStep"
    | "companyInfoStep"
    | "certificationsInfoStep"
    | "billingInfoStep"
    | "accountInfoStep";
  professionalSpaceInfos: Partial<ProfessionalSpaceInfo>;
}

type QualiopiCertificateInfoStepData = Pick<
  ProfessionalSpaceInfo,
  "qualiopiSwornStatement" | "qualiopiCertificateExpiresAt"
>;

type CompanyInfoStepData = Pick<
  ProfessionalSpaceInfo,
  | "companySiret"
  | "companyLegalStatus"
  | "companyName"
  | "companyAddress"
  | "companyZipCode"
  | "companyCity"
  | "companyWebsite"
>;

type BillingInfoStepData = Pick<
  ProfessionalSpaceInfo,
  | "companyBillingContactFirstname"
  | "companyBillingContactLastname"
  | "companyBillingEmail"
  | "companyBillingPhoneNumber"
  | "companyBic"
  | "companyIban"
>;

type AccountInfoStepData = Pick<
  ProfessionalSpaceInfo,
  "accountFirstname" | "accountLastname" | "accountEmail" | "accountPhoneNumber"
>;

type CertificationsInfoStepData = Pick<ProfessionalSpaceInfo, "typology">;

type ProfessionalSpaceCreationContext = ProfessionalSpaceCreationState & {
  goBackToPreviousStep: () => void;
  submitQualiopiCertificateInfoStep: (
    stepDatz: QualiopiCertificateInfoStepData
  ) => void;
  submitCompanyInfoStep: (stepData: CompanyInfoStepData) => void;
  submitCertificationsInfoStep: (stepData: CertificationsInfoStepData) => void;
  submitBillingInfoStep: (stepData: BillingInfoStepData) => void;
  submitAccountInfoStep: (stepData: AccountInfoStepData) => void;
};

const ProfessionalSpaceCreationContext =
  createContext<ProfessionalSpaceCreationContext>(
    {} as ProfessionalSpaceCreationContext
  );

export const ProfessionalSpaceCreationProvider = (props: {
  children?: ReactNode;
}) => {
  const router = useRouter();

  const [state, setState] = useState<ProfessionalSpaceCreationState>({
    currentStep: "qualiopiCertificateInfoStep",
    professionalSpaceInfos: {
      companyLegalStatus: "EI",
      domaineIds: [],
    },
  });

  const goBackToPreviousStep = useCallback(() => {
    let newCurrentStep = state.currentStep;

    switch (state.currentStep) {
      case "companyInfoStep":
        newCurrentStep = "qualiopiCertificateInfoStep";
        break;

      case "certificationsInfoStep":
        newCurrentStep = "companyInfoStep";
        break;
      case "billingInfoStep":
        newCurrentStep = "certificationsInfoStep";
        break;
      case "accountInfoStep":
        newCurrentStep = "billingInfoStep";
        break;
    }
    setState({ ...state, currentStep: newCurrentStep });
  }, [state]);

  const submitQualiopiCertificateInfoStep = useCallback(
    (stepData: QualiopiCertificateInfoStepData) => {
      setState({
        currentStep: "companyInfoStep",
        professionalSpaceInfos: {
          ...state.professionalSpaceInfos,
          ...stepData,
        },
      });
    },
    [state]
  );
  const submitCompanyInfoStep = useCallback(
    (stepData: CompanyInfoStepData) => {
      setState({
        currentStep: "certificationsInfoStep",
        professionalSpaceInfos: {
          ...state.professionalSpaceInfos,
          ...stepData,
        },
      });
    },
    [state]
  );

  const submitCertificationsInfoStep = useCallback(
    (stepData: CertificationsInfoStepData) => {
      setState({
        currentStep: "billingInfoStep",
        professionalSpaceInfos: {
          ...state.professionalSpaceInfos,
          ...stepData,
        },
      });
    },
    [state]
  );

  const submitBillingInfoStep = useCallback(
    (stepData: BillingInfoStepData) => {
      setState({
        currentStep: "accountInfoStep",
        professionalSpaceInfos: {
          ...state.professionalSpaceInfos,
          ...stepData,
        },
      });
    },
    [state]
  );

  const executeGraphqlSubscriptionMutation = useCallback(
    (
      professionalSpaceInfos: Omit<
        ProfessionalSpaceInfo,
        "qualiopiSwornStatement"
      >
    ) => {
      const createSubscription = gql`
        mutation createSubscriptionRequest(
          $subscriptionRequest: SubscriptionRequestInput!
        ) {
          subscription_createSubscriptionRequest(
            subscriptionRequest: $subscriptionRequest
          ) {
            id
          }
        }
      `;

      return request(GRAPHQL_API_URL, createSubscription, {
        subscriptionRequest: professionalSpaceInfos,
      });
    },
    []
  );

  const submitAccountInfoStep = useCallback(
    async (stepData: AccountInfoStepData) => {
      const newState: ProfessionalSpaceCreationState = {
        currentStep: "accountInfoStep",
        professionalSpaceInfos: {
          ...state.professionalSpaceInfos,
          ...stepData,
        },
      };
      setState(newState);

      const { qualiopiSwornStatement, ...mutationParameters } =
        newState.professionalSpaceInfos;

      await executeGraphqlSubscriptionMutation(
        mutationParameters as ProfessionalSpaceInfo
      );
      router.push("/espace-professionnel/creation/confirmation");
    },
    [executeGraphqlSubscriptionMutation, router, state.professionalSpaceInfos]
  );

  return (
    <ProfessionalSpaceCreationContext.Provider
      value={{
        ...state,
        goBackToPreviousStep,
        submitQualiopiCertificateInfoStep,
        submitCompanyInfoStep,
        submitCertificationsInfoStep,
        submitBillingInfoStep,
        submitAccountInfoStep,
      }}
    >
      {props.children}
    </ProfessionalSpaceCreationContext.Provider>
  );
};

export const useProfessionalSpaceCreationContext = () =>
  useContext(ProfessionalSpaceCreationContext);
