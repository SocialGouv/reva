interface EmailLinkProps {
  email: string;
  dataTest?: string;
}

export const EmailLink = ({ email, dataTest }: EmailLinkProps) => {
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
