interface EmailLinkProps {
  email: string;
  "data-test"?: string;
}

export const EmailLink = ({ email, "data-test": dataTest }: EmailLinkProps) => {
  const mailtoHref = `mailto:${email}`;
  return (
    <a
      className="text-gray-500 underline hover:text-blue-800 hover:font-semibold"
      href={mailtoHref}
      data-test={dataTest}
    >
      {email}
    </a>
  );
};
