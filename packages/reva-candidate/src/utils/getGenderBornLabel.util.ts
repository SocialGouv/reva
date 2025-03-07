import { GenderEnum } from "@/constants";
import { Gender } from "@/graphql/generated/graphql";

export function getGenderBornLabel(gender: Gender) {
  switch (gender) {
    case GenderEnum.man:
      return "Né";
    case GenderEnum.woman:
      return "Née";
    case GenderEnum.undisclosed:
      return "Né";
  }
}
