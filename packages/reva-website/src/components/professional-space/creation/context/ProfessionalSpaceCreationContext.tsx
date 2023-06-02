import { GRAPHQL_API_URL } from "@/config/config";
import request, { gql } from "graphql-request";
import { useRouter } from "next/router";
import { useCallback, useContext, useState } from "react";
import { createContext, ReactNode } from "react";

type LegalStatus =
  | "ASSOCIATION_LOI_1901"
  | "EI"
  | "EIRL"
  | "EURL"
  | "SARL"
  | "SAS"
  | "SASU"
  | "SA";

interface ProfessionalSpaceInfo {
  cguAcceptance: boolean;
  companySiret: string;
  companyLegalStatus: LegalStatus;
  companyName: string;
  companyAddress: string;
  companyZipCode: string;
  companyCity: string;
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
    | "cguStep"
    | "qualiopiCertificateInfoStep"
    | "companyInfoStep"
    | "certificationsInfoStep"
    | "accountInfoStep";
  professionalSpaceInfos: Partial<ProfessionalSpaceInfo>;
}

type cguStepData = Pick<ProfessionalSpaceInfo, "cguAcceptance">;

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

type AccountInfoStepData = Pick<
  ProfessionalSpaceInfo,
  "accountFirstname" | "accountLastname" | "accountEmail" | "accountPhoneNumber"
>;

type CertificationsInfoStepData = Pick<ProfessionalSpaceInfo, "typology">;

type ProfessionalSpaceCreationContext = ProfessionalSpaceCreationState & {
  goBackToPreviousStep: () => void;
  submitCguStep: (stepData: cguStepData) => void;
  submitQualiopiCertificateInfoStep: (
    stepData: QualiopiCertificateInfoStepData
  ) => void;
  submitCompanyInfoStep: (stepData: CompanyInfoStepData) => void;
  submitCertificationsInfoStep: (stepData: CertificationsInfoStepData) => void;
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
    currentStep: "cguStep",
    professionalSpaceInfos: {
      companyLegalStatus: "ASSOCIATION_LOI_1901",
      domaineIds: [],
    },
  });

  const goBackToPreviousStep = useCallback(() => {
    let newCurrentStep = state.currentStep;

    switch (state.currentStep) {
      case "qualiopiCertificateInfoStep":
        newCurrentStep = "cguStep";
        break;
      case "companyInfoStep":
        newCurrentStep = "qualiopiCertificateInfoStep";
        break;
      case "certificationsInfoStep":
        newCurrentStep = "companyInfoStep";
        break;
      case "accountInfoStep":
        newCurrentStep = "certificationsInfoStep";
        break;
    }
    setState({ ...state, currentStep: newCurrentStep });
  }, [state]);

  const submitCguStep = useCallback(
    (stepData: cguStepData) => {
      setState({
        currentStep: "qualiopiCertificateInfoStep",
        professionalSpaceInfos: {
          ...state.professionalSpaceInfos,
          ...stepData,
        },
      });
    },
    [state]
  );

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

      const { qualiopiSwornStatement, cguAcceptance, ...mutationParameters } =
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
        submitCguStep,
        submitQualiopiCertificateInfoStep,
        submitCompanyInfoStep,
        submitCertificationsInfoStep,
        submitAccountInfoStep,
      }}
    >
      {props.children}
    </ProfessionalSpaceCreationContext.Provider>
  );
};

export const useProfessionalSpaceCreationContext = () =>
  useContext(ProfessionalSpaceCreationContext);
