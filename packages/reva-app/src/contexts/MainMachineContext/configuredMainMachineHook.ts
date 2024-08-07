import {
  ApolloClient,
  ApolloContextValue,
  getApolloContext,
} from "@apollo/client";
import { Certification, Goal, candidacyStatus } from "interface";
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
    getApolloContext() as React.Context<ApolloContextValue>,
  );

  //@ts-ignore
  const { authenticated, setTokens } = useKeycloakContext();

  const machine = useMemo(
    () =>
      mainMachine(authenticated).withConfig({
        services: {
          searchCertifications: (context, _event) => {
            return searchCertifications(client as ApolloClient<object>)({
              pageNumber: context.currentCertificationPageNumber,
              searchText: context.certificationSearchText,
            });
          },
          loadDepartments: () => getDepartments(client as ApolloClient<object>),
          initializeApp: async (_context, _event, { data }) => {
            if (authenticated && !data.isConfirmEmail) {
              const data = await getCandidateWithCandidacy(
                client as ApolloClient<object>,
              );

              //if the candidacy is still in project and a certification has been chosen but became inactive we reset the certification and the aap of the candidacy
              data.candidacy =
                resetCandidacyCertificationAndAAPIfCertificationIsInactiveAndCandidacyIsStillInProject(
                  data.candidacy,
                );

              const activeFeatures = await getActiveFeaturesForConnectedUser(
                client as ApolloClient<object>,
              );

              return { ...data, activeFeatures };
            } else {
              const { tokens, ...rest } = await confirmRegistration(
                client as ApolloClient<object>,
              )({
                token: data.loginToken,
              });
              setTokens(tokens);
              const activeFeatures = await getActiveFeaturesForConnectedUser(
                client as ApolloClient<object>,
              );
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
              organismSearchZip: zip,
              organismSearchPmr: pmr,
            } = context;
            if (!candidacyId)
              return Promise.reject(
                "unavailable candidacyId in XState context",
              );

            if (!selectedDepartment)
              return Promise.reject(
                "unavailable selectedDepartment in XState context",
              );

            const formatSearchFilter = () => {
              if (organismSearchOnsite) {
                return {
                  distanceStatus: "ONSITE",
                  pmr,
                  zip,
                };
              }
              if (organismSearchRemote) {
                return {
                  distanceStatus: "REMOTE",
                  pmr: undefined,
                  zip: undefined,
                };
              }
              return {
                distanceStatus: undefined,
                pmr: undefined,
                zip: undefined,
              };
            };
            const searchFilter = formatSearchFilter();

            return getRandomOrganismsForCandidacy(
              client as ApolloClient<object>,
            )({
              candidacyId,
              searchText,
              searchFilter,
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

            await updateCertification(client as ApolloClient<object>)({
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
                "unavailable candidacyId or organism in XState context",
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
            await saveGoals(client as ApolloClient<object>)({
              candidacyId: context.candidacyId,
              goals: event.goals
                .filter((g) => g.checked)
                .map((g) => ({ id: g.id })),
            });
            return event.goals;
          },
          saveExperience: async (context, event) => {
            if (event.type !== "SUBMIT_EXPERIENCE" || !context.candidacyId) {
              return Promise.reject("Impossible state");
            }

            if (!!event.experience.id) {
              const { id, ...experienceContent } = event.experience;
              return updateExperience(client as ApolloClient<object>)({
                candidacyId: context.candidacyId,
                experienceId: event.experience.id,
                experience: experienceContent,
              });
            } else {
              return addExperience(client as ApolloClient<object>)({
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
              event.contact,
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

            return submitCandidacy(client as ApolloClient<object>)({
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
    [client],
  );

  return { configuredMainMachine: machine };
};

const resetCandidacyCertificationAndAAPIfCertificationIsInactiveAndCandidacyIsStillInProject =
  (candidacy: {
    certification?: Certification;
    organism?: unknown;
    goals: Goal[];
    experiences: unknown[];
    candidacyStatuses: { isActive: boolean; status: candidacyStatus }[];
  }) => {
    let newCandidacy = { ...candidacy };

    const activeCandidacyStatus = candidacy.candidacyStatuses.find(
      (s) => s.isActive === true,
    );

    if (
      activeCandidacyStatus?.status === "PROJET" &&
      newCandidacy.certification?.status === "INACTIVE"
    ) {
      newCandidacy.certification = undefined;
      newCandidacy.organism = undefined;
    }

    return newCandidacy;
  };
