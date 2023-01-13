import {
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  Select,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { SyntheticEvent, useCallback, useReducer } from "react";
import { Competency, Job, JobAndCompetencies } from "../../types/types";
import { useRouter } from "next/router";
import { useMainImportContext } from "../../components/main-context/MainContext";

const jobAndCompetenciesReducer = (
  state: JobAndCompetencies,
  action:
    | { type: "set_job"; payload: Job }
    | { type: "set_competencies"; payload: Competency[] }
) => {
  let newState = { ...state };
  switch (action.type) {
    case "set_job":
      newState = { job: action.payload, competencies: [] };
      break;
    case "set_competencies":
      newState = { ...state, competencies: action.payload };
      break;
  }
  return newState;
};

const AddCompetenciesPage = () => {
  const router = useRouter();
  const { userInfos, updateUserInfos } = useMainImportContext();

  const [jobAndCompetencies, dispatchJobAndCompetenciesEvent] = useReducer(
    jobAndCompetenciesReducer,
    { job: null, competencies: [] }
  );

  const { data: jobsData } = useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: async () => (await fetch("/api/jobs")).json(),
  });

  const { data: competenciesData } = useQuery<Competency[]>({
    queryKey: ["competencies", jobAndCompetencies.job?.code],
    queryFn: async () =>
      (
        await fetch(
          "/api/competencies?" +
            new URLSearchParams({ jobCode: jobAndCompetencies.job?.code || "" })
        )
      ).json(),
    enabled: !!jobAndCompetencies.job?.code,
  });

  const handleSubmit = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault();
      updateUserInfos({
        ...userInfos,
        jobsAndCompetencies: [
          ...userInfos.jobsAndCompetencies,
          jobAndCompetencies,
        ],
      });
      router.push("/diagnosis/add-experience");
    },
    [jobAndCompetencies, router, updateUserInfos, userInfos]
  );

  return (
    <Flex p={12} direction="column" justifyContent="center" alignItems="center">
      <Flex direction="column" alignItems="flex-start">
        <Flex alignItems="center" gap={4} w="500px">
          <label>Expérience:</label>
          <Select
            onChange={(e) =>
              dispatchJobAndCompetenciesEvent({
                type: "set_job",
                payload: jobsData?.find(
                  (j) => j.code === e.target.value
                ) as Job,
              })
            }
          >
            <option />
            {jobsData?.map((j) => (
              <option key={j.code} value={j.code}>
                {j.label}
              </option>
            ))}
          </Select>
        </Flex>
        <br />
        <CheckboxGroup
          defaultValue={jobAndCompetencies.competencies.map((c) => c.code)}
          onChange={(v) =>
            dispatchJobAndCompetenciesEvent({
              type: "set_competencies",
              payload:
                competenciesData?.filter((c) => v.includes(c.code)) || [],
            })
          }
        >
          <Flex wrap="wrap" gap={4}>
            {competenciesData?.map((c) => (
              <Checkbox key={c.code} value={c.code}>
                {c.label}
              </Checkbox>
            ))}
          </Flex>
        </CheckboxGroup>
        <br />
        <br />
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <Button type="submit" colorScheme="blue" w="100%">
            Ajouter expérience
          </Button>
        </form>
      </Flex>
    </Flex>
  );
};

export default AddCompetenciesPage;
