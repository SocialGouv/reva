import { Flex, Input, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { SyntheticEvent, useCallback, useState } from "react";
import { useMainImportContext } from "../components/main-context/MainContext";

export default function Home() {
  const [revaIdentifier, setRevaIdentifier] = useState("");
  const { userInfos, updateUserInfos } = useMainImportContext();
  const router = useRouter();

  const handleSubmit = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault();
      updateUserInfos({ ...userInfos, revaIdentifier });
      router.push("/diagnosis/add-experience");
    },
    [revaIdentifier, router, updateUserInfos, userInfos]
  );

  return (
    <Flex direction="column" alignItems="center" h="100vh" p={12}>
      <Text>Hello</Text>
      <br />
      <form onSubmit={handleSubmit}>
        <Input
          placeholder="Entrez votre identifiant REVA"
          colorScheme="blue"
          rounded="xl"
          w="400px"
          textAlign="center"
          onChange={(e) => setRevaIdentifier(e.target.value)}
        ></Input>
      </form>
    </Flex>
  );
}
