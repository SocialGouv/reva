import mercurius from "mercurius";

export type ResolverFirstArgument = unknown;
export type ResolverPayload = { candidacyId?: string } | any;
export type ResolverContext = {
  auth: {
    token: string;
    userInfo?: Record<string, any>;
    hasRole: (role: string) => boolean;
  };
  reply: any;
  app: any;
};
export type ResolverArgs = [
  ResolverFirstArgument,
  ResolverPayload,
  ResolverContext
];

export type ResolverFunction<T> = (...args: ResolverArgs) => Promise<T>;

export type Resolver<T> = ResolverFunction<mercurius.ErrorWithProps | T>;

export type ResolverDict = Record<string, Resolver<any>>;
