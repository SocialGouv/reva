import { Button, Flex, Heading } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { CompetencyCard } from "../../components/competency-card/CompetencyCard";
import { useMainImportContext } from "../../components/main-context/MainContext";

const AddExperiencePage = () => {
  const router = useRouter();
  const { userInfos, computeDiagnosis } = useMainImportContext();

  const handleShowDiagnosisButtonClick = useCallback(async () => {
    await computeDiagnosis();
    router.push("/diagnosis/show-diagnosis");
  }, [computeDiagnosis, router]);

  return (
    <Flex p={12} direction="column" alignItems="center">
      <Flex direction="column" alignItems="flex-start" w="500px">
        <Flex direction="column" gap={8}>
          {userInfos.jobsAndCompetencies.map((jAndC, i) => (
            <Flex direction="column" gap={4} key={i}>
              <Heading size="md">{jAndC.job?.label}</Heading>
              <Flex wrap="wrap" gap={4}>
                {jAndC.competencies.map((c) => (
                  <CompetencyCard key={c.code} label={c.label} />
                ))}
              </Flex>
            </Flex>
          ))}
        </Flex>
        <br />
        <br />
        <Button
          w="100%"
          colorScheme="blue"
          onClick={handleShowDiagnosisButtonClick}
        >
          Voir mon diagnostic
        </Button>
        <br />
        <Button
          w="100%"
          colorScheme="blue"
          onClick={() => router.push("/diagnosis/add-competencies")}
        >
          Ajouter une expérience
        </Button>
      </Flex>
    </Flex>
  );
};

export default AddExperiencePage;
