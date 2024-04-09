import Button from "@codegouvfr/react-dsfr/Button";

import { useFeatureflipping } from "../feature-flipping/featureFlipping";
import { useAuth } from "../auth/auth";

import { CopyClipBoard } from "../copy-clip-board";

import { useHooks } from "./Impersonate.hooks";

interface Props {
  candidateId?: string;
  accountId?: string;
}

export const Impersonate = (props: Props): JSX.Element | null => {
  const { candidateId, accountId } = props;

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
      <Button priority="secondary" type="button">
        Impersonate
      </Button>
    </CopyClipBoard>
  ) : null;
};
