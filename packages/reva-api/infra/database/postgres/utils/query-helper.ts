import { Prisma } from "@prisma/client";

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export const filterClause = (params: GetSubscriptionRequestsParams) => {
  if (params.filter) {
    return {
      where: {
        accountLastname: {
          contains: params.filter as string,
          mode: Prisma.QueryMode.insensitive,
        },
      },
    };
  }
};

export const paginationClause = (params: PaginationParams) => {
  const clause: { take?: number; skip?: number } = {};
  if (params.limit) {
    clause.take = params.limit;
  }
  if (params.offset) {
    clause.skip = params.offset;
  }
  return clause;
};

export const sortClause = (params: GetSubscriptionRequestsParams) => {
  if (params.orderBy) {
    return {
      orderBy: [
        ...Object.entries(params.orderBy).map(([column, value]) => ({
          [column]: value,
        })),
      ],
    };
  }
};
