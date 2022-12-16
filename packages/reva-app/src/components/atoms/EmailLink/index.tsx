interface EmailLinkProps {
    email: string;
}
  
export const EmailLink = ({email}: EmailLinkProps) => {
    const mailtoHref = `mailto:${email}`;
    return (
      <a className="text-gray-500 underline hover:text-blue-800 hover:font-semibold" href={mailtoHref}>{email}</a>
    )
}