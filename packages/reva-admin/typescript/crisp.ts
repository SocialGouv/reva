import { Crisp } from "crisp-sdk-web";
import { MD5 } from "crypto-js";

type CrispUser = {
  id: string;
  email: string | null;
};

export class CrispElm {
  private static instance: CrispElm;

  private loaded: boolean = false;

  private user?: CrispUser = undefined;

  private constructor() {
    const crispId = import.meta.env.VITE_CRISP_ID;
    if (crispId) {
      Crisp.configure(crispId, {
        autoload: true,
        sessionMerge: true,
      });

      Crisp.session.onLoaded(() => {
        this.loaded = true;
      });
    }
  }

  public static getInstance(): CrispElm {
    if (!CrispElm.instance) {
      CrispElm.instance = new CrispElm();
    }

    return CrispElm.instance;
  }

  private setUser(user: CrispUser | undefined): void {
    this.user = user;
  }

  private async resetCrispSession() {
    while (this.loaded != true) {
      await wait(1000);
    }

    Crisp.session.reset();
  }

  resetUser() {
    if (!!this.user?.id) {
      // Update user
      this.setUser(undefined);

      Crisp.setTokenId("");

      this.resetCrispSession();
    }
  }

  configureUser(_user: CrispUser): void {
    if (this.user?.id !== _user.id) {
      // Update user
      this.setUser(_user);

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

      this.resetCrispSession();
    }
  }
}

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
