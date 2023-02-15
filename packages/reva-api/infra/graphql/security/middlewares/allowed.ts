import { IFieldResolver, MercuriusContext } from "mercurius";

export const allowed = () => (next: IFieldResolver<unknown>) =>
(
  root: any,
  args: Record<string, any>,
  context: MercuriusContext,
  info: any
) => {
  return next(root, args, context, info);
};
