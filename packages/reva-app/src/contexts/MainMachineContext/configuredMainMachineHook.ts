import {
  ApolloClient,
  ApolloContextValue,
  getApolloContext,
} from "@apollo/client";
import { Device } from "@capacitor/device";
import { useContext, useMemo } from "react";
import { getDepartments } from "services/referenceDataService";

import { mainMachine } from "../../machines/main.machine";
import {
  addExperience,
  askForLogin,
  askForRegistration,
  confirmRegistration,
  confirmTrainingForm,
  getCandidateWithCandidacy,
  saveGoals,
  submitCandidacy,
  updateCertification,
  updateExperience,
} from "../../services/candidacyServices";
import {
  getRandomOrganismsForCandidacy,
  selectOrganismForCandidacy,
} from "../../services/organismServices";
import { searchCertifications } from "../../services/searchServices";
import { useKeycloakContext } from "../keycloakContext";

export const useConfiguredMainMachine = () => {
  const { client } = useContext(
    getApolloContext() as React.Context<ApolloContextValue>
  );

  //@ts-ignore
  const { authenticated, token, setTokens } = useKeycloakContext();

  const machine = useMemo(
    () =>
      mainMachine(authenticated).withConfig({
        services: {
          searchCertifications: (context, _event) => {
            return searchCertifications(client as ApolloClient<object>)({
              pageNumber: context.currentCertificationPageNumber,
              departementId: context.selectedDepartment?.id || "",
              searchText: context.certificationSearchText,
            });
          },
          loadDepartments: () =>
            getDepartments(client as ApolloClient<object>)({
              token,
            }),
          initializeApp: async (_context, _event, { data }) => {
            if (authenticated) {
              const data = await getCandidateWithCandidacy(
                client as ApolloClient<object>
              )({ token });
              return data;
            } else {
              const { tokens, ...rest } = await confirmRegistration(
                client as ApolloClient<object>
              )({
                token: data.loginToken,
              });
              setTokens(tokens);
              return rest;
            }
          },
          getOrganisms: async (context, _event) => {
            if (!context.candidacyId)
              return Promise.reject(
                "unavailable candidacyId in XState context"
              );

            return getRandomOrganismsForCandidacy(
              client as ApolloClient<object>
            )({
              candidacyId: context.candidacyId,
              searchText: context.organismSearchText,
            });
          },
          updateCertification: async (context, event) => {
            if (
              event.type !== "SUBMIT_CERTIFICATION" ||
              !context.certification ||
              !context.candidacyId
            ) {
              return Promise.reject("Impossible state");
            }
            const deviceId = await Device.getId();

            return updateCertification(client as ApolloClient<object>)({
              deviceId: deviceId.uuid,
              candidacyId: context.candidacyId,
              certificationId: event.certification.id,
              departmentId: context.selectedDepartment?.id || "",
            });
          },
          setOrganismsForCandidacy: async (context, _event) => {
            if (!context.candidacyId || !context.organism?.id)
              return Promise.reject(
                "unavailable candidacyId or organism in XState context"
              );

            return selectOrganismForCandidacy(client as ApolloClient<object>)({
              candidacyId: context.candidacyId,
              organismId: context.organism.id,
            });
          },
          saveGoals: async (context, event) => {
            if (event.type !== "SUBMIT_GOALS" || !context.candidacyId) {
              return Promise.reject("Impossible state");
            }
            const deviceId = await Device.getId();
            await saveGoals(client as ApolloClient<object>)({
              deviceId: deviceId.uuid,
              candidacyId: context.candidacyId,
              goals: event.goals
                .filter((g) => g.checked)
                .map((g) => ({ goalId: g.id })),
            });
            return event.goals;
          },
          saveExperience: async (context, event) => {
            if (event.type !== "SUBMIT_EXPERIENCE" || !context.candidacyId) {
              return Promise.reject("Impossible state");
            }

            const deviceId = await Device.getId();

            if (!!event.experience.id) {
              const { id, ...experienceContent } = event.experience;
              return updateExperience(client as ApolloClient<object>)({
                deviceId: deviceId.uuid,
                candidacyId: context.candidacyId,
                experienceId: event.experience.id,
                experience: experienceContent,
              });
            } else {
              return addExperience(client as ApolloClient<object>)({
                deviceId: deviceId.uuid,
                candidacyId: context.candidacyId,
                experience: event.experience,
              });
            }
          },
          askForLogin: async (context, event) => {
            if (event.type !== "SUBMIT_LOGIN") {
              return Promise.reject("Impossible state");
            }

            return askForLogin(client as ApolloClient<object>)(event.login);
          },
          askForRegistration: async (context, event) => {
            if (event.type !== "SUBMIT_CONTACT") {
              return Promise.reject("Impossible state");
            }

            return askForRegistration(client as ApolloClient<object>)(
              event.contact
            );
          },
          submitCandidacy: async (context, event) => {
            if (event.type !== "SUBMIT_PROJECT" || !context.candidacyId) {
              return Promise.reject("Impossible state");
            }

            const deviceId = await Device.getId();
            return submitCandidacy(client as ApolloClient<object>)({
              deviceId: deviceId.uuid,
              candidacyId: context.candidacyId,
            });
          },
          confirmTrainingForm: async (context, event) => {
            if (
              event.type !== "SUBMIT_TRAINING_PROGRAM" ||
              !context.candidacyId
            ) {
              return Promise.reject("Impossible state");
            }
            return confirmTrainingForm(client as ApolloClient<object>)({
              candidacyId: context.candidacyId,
            });
          },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client]
  );

  return { configuredMainMachine: machine };
};
