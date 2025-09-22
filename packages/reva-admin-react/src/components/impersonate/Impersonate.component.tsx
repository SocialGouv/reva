import Button from "@codegouvfr/react-dsfr/Button";

import { useAuth } from "../auth/auth";
import { CopyClipBoard } from "../copy-clip-board/CopyClipBoard.component";
import { useFeatureflipping } from "../feature-flipping/featureFlipping";

import { useHooks } from "./Impersonate.hooks";

interface Props {
  candidateId?: string;
  accountId?: string;
  size?: "small" | "medium" | "large";
}

export const Impersonate = (props: Props) => {
  const { candidateId, accountId, size } = props;

  const { isFeatureActive } = useFeatureflipping();
  const { isAdmin } = useAuth();

  const { getImpersonateUrl } = useHooks();

  return isFeatureActive("IMPERSONATE") && isAdmin ? (
    <CopyClipBoard
      onClick={async (callback) => {
        const url = await getImpersonateUrl({ candidateId, accountId });
        if (url) {
          callback(url);
        }
      }}
    >
      <Button priority="secondary" type="button" size={size}>
        Impersonate
      </Button>
    </CopyClipBoard>
  ) : null;
};
