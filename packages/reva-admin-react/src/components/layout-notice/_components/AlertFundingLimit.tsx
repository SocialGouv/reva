import { NoticeAlert } from "@/components/notice/NoticeAlert";

export const AlertFundingLimit = () => {
  return (
    <NoticeAlert isClosable={false}>
      <p>
        <strong>À savoir :</strong>{" "}
        <span className="font-normal">
          Depuis le 2 juin 2024, les financements concernent uniquement les 24
          certifications des secteurs sanitaire et social.
        </span>
      </p>
    </NoticeAlert>
  );
};
