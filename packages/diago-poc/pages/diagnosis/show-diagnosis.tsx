import { Flex, Heading, Text } from "@chakra-ui/react";
import { CertificationCard } from "../../components/certification-card/CertificationCard";
import { useMainImportContext } from "../../components/main-context/MainContext";

const ShowDiagnosisPage = () => {
  const { userInfos } = useMainImportContext();
  return (
    <Flex p={12} direction="column" alignItems="center">
      <Flex direction="column">
        <Heading size="md">Diagnostic</Heading>
        <Text>Liste de certifications par pertinence</Text>
        <br />
        <Flex direction="column" gap={4}>
          {userInfos.diagnosis.map((c) => (
            <CertificationCard key={c.id} label={c.label} />
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ShowDiagnosisPage;
