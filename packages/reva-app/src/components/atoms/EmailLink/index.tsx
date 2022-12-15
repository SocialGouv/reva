interface EmailLinkProps {
    email: string;
  }
  
export const EmailLink = ({email}: EmailLinkProps) => {
    const mailtoHref = `mailto:${email}`;
    return (
      <a href={mailtoHref}>{email}</a>
    )
}