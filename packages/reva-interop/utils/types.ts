type NonNullable<T> = T extends null | undefined ? never : T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any, import/no-unused-modules
export type GetGqlPageInfo<T extends (...args: any) => any> = NonNullable<
  Awaited<ReturnType<T>>
>["info"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GetGqlRowType<T extends (...args: any) => any> = NonNullable<
  Awaited<ReturnType<T>>
>["rows"][number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GetGqlResponseType<T extends (...args: any) => any> = NonNullable<
  Awaited<ReturnType<T>>
>;

export type UploadedFile = {
  _buf: Buffer;
  filename: string;
  mimetype: string;
};
