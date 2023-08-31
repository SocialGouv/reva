import { Decimal } from "@prisma/client/runtime/library";
import { GraphQLScalarType, Kind } from "graphql";

import { logger } from "../../infra/logger";

export default new GraphQLScalarType({
  name: "Decimal",
  description: "The `Decimal` scalar type to represent currency values",

  serialize(value) {
    return (value as Decimal).toNumber();
  },

  parseLiteral(ast) {
    if (![Kind.FLOAT, Kind.INT, Kind.STRING].includes(ast.kind)) {
      logger.error(
        `Decimal scalar error cannot convert ${ast.kind} to decimal`
      );
      throw new TypeError(
        `${String(
          (ast as { value: string }).value
        )} is not a valid decimal value.`
      );
    }

    return new Decimal((ast as { value: string }).value);
  },

  parseValue(value) {
    return new Decimal(value as string);
  },
});
