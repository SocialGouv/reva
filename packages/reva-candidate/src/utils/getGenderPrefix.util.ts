import { GenderEnum } from "@/constants/genders.constant";

import { Gender } from "@/graphql/generated/graphql";

export function getGenderPrefix(gender: Gender) {
  switch (gender) {
    case GenderEnum.man:
      return "M. ";
    case GenderEnum.woman:
      return "Mme ";
    case GenderEnum.undisclosed:
      return "";
  }
}
