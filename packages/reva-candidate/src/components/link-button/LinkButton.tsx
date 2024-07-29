"use client";
import Button from "@codegouvfr/react-dsfr/Button";
import Link from "next/link";

export const LinkButton = ({
  href,
  children,
  priority = "secondary",
  "data-test":dataTest,
  prefetch = true,
  ...buttonProps
}: {
  href: string;
  children: React.ReactNode;
  priority?: "primary" | "secondary";
  "data-test"?: string;
  prefetch?: boolean;
} & React.ComponentProps<typeof Button>) => {
  return (
    <Button
      priority={priority}
      className="justify-center w-[100%] p-0 md:w-fit"
      data-test={dataTest}
      {...buttonProps}
    >
      <Link
        className="px-4 py-2"
        href={href}
        prefetch={prefetch}
      >
        {children}
      </Link>
    </Button>
  );
};
