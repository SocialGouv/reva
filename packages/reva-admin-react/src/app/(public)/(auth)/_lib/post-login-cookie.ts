// "use server" interdit ici : Next 16 exige que tous les exports d'un module
// "use server" soient async. Ces constantes sont importées par actions.ts et
// page.tsx.
export const POST_LOGIN_TOKENS_COOKIE = "post_login_tokens";
// Couvre /admin2/post-login (page) et /admin2/post-login/establish-sso (handler).
export const POST_LOGIN_TOKENS_COOKIE_PATH = "/admin2/post-login";
export const POST_LOGIN_TOKENS_COOKIE_MAX_AGE = 60;
