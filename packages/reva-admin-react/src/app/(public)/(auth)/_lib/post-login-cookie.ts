// "use server" interdit ici : tous les exports d'un module "use server"
// doivent etre async (Next 16), or ces constantes sont importees par
// actions.ts (use server) ET page.tsx (server component).
export const POST_LOGIN_TOKENS_COOKIE = "post_login_tokens";
export const POST_LOGIN_TOKENS_COOKIE_PATH = "/admin2/post-login";
export const POST_LOGIN_TOKENS_COOKIE_MAX_AGE = 60;
