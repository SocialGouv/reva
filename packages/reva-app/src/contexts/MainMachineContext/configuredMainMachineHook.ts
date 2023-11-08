import {
  ApolloClient,
  ApolloContextValue,
  getApolloContext,
} from "@apollo/client";
import { Device } from "@capacitor/device";
import { useContext, useMemo } from "react";
import { getActiveFeaturesForConnectedUser } from "services/featureFlippingServices";
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
  updateContact,
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
              const activeFeatures = await getActiveFeaturesForConnectedUser(
                client as ApolloClient<object>
              )({
                token,
              });

              return { ...data, activeFeatures };
            } else {
              const { tokens, ...rest } = await confirmRegistration(
                client as ApolloClient<object>
              )({
                token: data.loginToken,
              });
              setTokens(tokens);
              const activeFeatures = await getActiveFeaturesForConnectedUser(
                client as ApolloClient<object>
              )({
                token: data.loginToken,
              });
              return { ...rest, activeFeatures };
            }
          },
          getOrganisms: async (context, _event) => {
            const {
              candidacyId,
              selectedDepartment,
              organismSearchRemote,
              organismSearchOnsite,
              organismSearchText: searchText,
            } = context;
            if (!candidacyId)
              return Promise.reject(
                "unavailable candidacyId in XState context"
              );

            if (!selectedDepartment)
              return Promise.reject(
                "unavailable selectedDepartment in XState context"
              );

            const distanceStatus =
              (organismSearchOnsite && organismSearchRemote) ||
              (!organismSearchOnsite && !organismSearchRemote)
                ? undefined
                : organismSearchOnsite
                ? "ONSITE"
                : "REMOTE";

            return getRandomOrganismsForCandidacy(
              client as ApolloClient<object>
            )({
              candidacyId,
              departmentId: selectedDepartment?.id,
              searchText,
              searchFilter: { distanceStatus },
            });
          },
          updateCertification: async (context, event) => {
            if (
              event.type !== "SUBMIT_CERTIFICATION" ||
              !event.certification ||
              !context.candidacyId
            ) {
              return Promise.reject("Impossible state");
            }
            const deviceId = await Device.getId();

            await updateCertification(client as ApolloClient<object>)({
              deviceId: deviceId.uuid,
              candidacyId: context.candidacyId,
              certificationId: event.certification.id,
              departmentId: context.selectedDepartment?.id || "",
            });
            return event.certification;
          },
          setOrganismsForCandidacy: async (context, event) => {
            if (
              event.type !== "SUBMIT_ORGANISM" ||
              !context.candidacyId ||
              !event.organism?.selectedOrganismId
            )
              return Promise.reject(
                "unavailable candidacyId or organism in XState context"
              );

            await selectOrganismForCandidacy(client as ApolloClient<object>)({
              candidacyId: context.candidacyId,
              organismId: event.organism.selectedOrganismId,
            });
            return event;
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
          updateContact: async (context, event) => {
            if (event.type !== "UPDATE_CONTACT" || !context.candidacyId) {
              return Promise.reject("Impossible state");
            }

            return updateContact(client as ApolloClient<object>)({
              candidateId: context.contact?.candidateId || "unknown candidate",
              candidateData: {
                firstname: event.contact.firstname,
                lastname: event.contact.lastname,
                phone: event.contact.phone,
                email: event.contact.email,
              },
            });
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
