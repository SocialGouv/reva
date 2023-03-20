import request, { gql } from "graphql-request";
import { useRouter } from "next/router";
import { useCallback, useContext, useState } from "react";
import { createContext, ReactNode } from "react";

type LegalStatus = "EI" | "EURL" | "SARL" | "SAS" | "SASU" | "SA";

interface ProfessionalSpaceInfos {
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
}
interface ProfessionalSpaceCreationState {
  currentStep: "stepOne" | "stepTwo" | "stepThree";
  professionalSpaceInfos: Partial<ProfessionalSpaceInfos>;
}

type StepOneData = Pick<
  ProfessionalSpaceInfos,
  | "companySiret"
  | "companyLegalStatus"
  | "companyName"
  | "companyAddress"
  | "companyZipCode"
  | "companyCity"
>;

type StepTwoData = Pick<
  ProfessionalSpaceInfos,
  | "companyBillingContactFirstname"
  | "companyBillingContactLastname"
  | "companyBillingEmail"
  | "companyBillingPhoneNumber"
  | "companyBic"
  | "companyIban"
>;

type StepThreeData = Pick<
  ProfessionalSpaceInfos,
  "accountFirstname" | "accountLastname" | "accountEmail" | "accountPhoneNumber"
>;

type ProfessionalSpaceCreationContext = ProfessionalSpaceCreationState & {
  goBackToPreviousStep: () => void;
  submitStepOne: (stepData: StepOneData) => void;
  submitStepTwo: (stepData: StepTwoData) => void;
  submitStepThree: (stepData: StepThreeData) => void;
};

const GRAPHQL_API_URL =
  process.env.NEXT_PUBLIC_WEBSITE_API_GRAPHQL ||
  "http://localhost:8080/graphql";

const ProfessionalSpaceCreationContext =
  createContext<ProfessionalSpaceCreationContext>(
    {} as ProfessionalSpaceCreationContext
  );

export const ProfessionalSpaceCreationProvider = (props: {
  children?: ReactNode;
}) => {
  const router = useRouter();

  const [state, setState] = useState<ProfessionalSpaceCreationState>({
    currentStep: "stepOne",
    professionalSpaceInfos: {
      companyLegalStatus: "EI",
    },
  });

  const goBackToPreviousStep = useCallback(() => {
    let newCurrentStep = state.currentStep;

    switch (state.currentStep) {
      case "stepTwo":
        newCurrentStep = "stepOne";
        break;
      case "stepThree":
        newCurrentStep = "stepTwo";
        break;
    }
    setState({ ...state, currentStep: newCurrentStep });
  }, [state]);

  const submitStepOne = useCallback(
    (stepData: StepOneData) => {
      setState({
        currentStep: "stepTwo",
        professionalSpaceInfos: {
          ...state.professionalSpaceInfos,
          ...stepData,
        },
      });
    },
    [state]
  );

  const submitStepTwo = useCallback(
    (stepData: StepTwoData) => {
      setState({
        currentStep: "stepThree",
        professionalSpaceInfos: {
          ...state.professionalSpaceInfos,
          ...stepData,
        },
      });
    },
    [state]
  );

  const executeGraphqlSubscriptionMutation = useCallback(
    (professionalSpaceInfos: ProfessionalSpaceInfos) => {
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

  const submitStepThree = useCallback(
    async (stepData: StepThreeData) => {
      const newState: ProfessionalSpaceCreationState = {
        currentStep: "stepThree" as const,
        professionalSpaceInfos: {
          ...state.professionalSpaceInfos,
          ...stepData,
        },
      };
      setState(newState);
      await executeGraphqlSubscriptionMutation(
        newState.professionalSpaceInfos as ProfessionalSpaceInfos
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
        submitStepOne,
        submitStepTwo,
        submitStepThree,
      }}
    >
      {props.children}
    </ProfessionalSpaceCreationContext.Provider>
  );
};

export const useProfessionalSpaceCreationContext = () =>
  useContext(ProfessionalSpaceCreationContext);
