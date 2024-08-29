import Notice from "@codegouvfr/react-dsfr/Notice";

export const CustomInfoNotice = ({ title }: { title: string }) => {
  return (
    <Notice
      isClosable
      onClose={function noRefCheck() {}}
      title={title}
      className="-mb-8"
    />
  );
};
