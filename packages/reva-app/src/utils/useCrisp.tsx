import { Crisp } from "crisp-sdk-web";
import { MD5 } from "crypto-js";
import { useEffect, useState } from "react";

type CrispUser = {
  id: string;
  email: string | null;
};

export const useCrisp = (): {
  configureUser: (user: CrispUser) => void;
  resetUser: () => void;
} => {
  const crispId = process.env.REACT_APP_CRISP_ID;

  const [loaded, setLoaded] = useState(false);
  const [waitingForReset, setWaitingForReset] = useState(false);

  const [user, setUser] = useState<CrispUser | undefined>();

  useEffect(() => {
    if (crispId) {
      Crisp.configure(crispId, {
        autoload: true,
        sessionMerge: true,
      });

      Crisp.session.onLoaded(() => {
        setLoaded(true);
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loaded && waitingForReset) {
      Crisp.session.reset();

      setWaitingForReset(false);
    }
  }, [loaded, waitingForReset]);

  const resetUser = () => {
    if (!!user?.id) {
      // Update user
      setUser(undefined);

      Crisp.setTokenId("");

      setWaitingForReset(true);
    }
  };

  const configureUser = (_user: CrispUser): void => {
    if (user?.id !== _user.id) {
      // Update user
      setUser(_user);

      // Hash token
      const tokenMD5 = MD5(_user.id).toString();
      Crisp.setTokenId(tokenMD5);

      try {
        if (_user.email) {
          Crisp.user.setEmail(_user.email);
        }
      } catch (error) {
        console.error(error);
      }

      setWaitingForReset(true);
    }
  };

  return { configureUser, resetUser };
};
