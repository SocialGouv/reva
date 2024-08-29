import { NoticeAlert } from "@/components/notice/NoticeAlert";

export const AlertFundingLimit = () => {
  return (
    <NoticeAlert>
      <p>
        <strong>À savoir :</strong>{" "}
        <span className="font-normal">
          Depuis le 2 juin 2024, les financements (plafonnés à 3500€) concernent
          uniquement les 24 certifications des secteurs sanitaire et social.
        </span>
      </p>
    </NoticeAlert>
  );
};
