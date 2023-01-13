import { chakra, Flex } from "@chakra-ui/react";

export const CompetencyCard = chakra((props: { label: string }) => (
  <Flex rounded="md" border="1px solid black" px={4} py={2}>
    {props.label}
  </Flex>
));
