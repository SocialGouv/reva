// @ts-ignore
import { Elm } from "../src/Main.elm";

const app = Elm.Main.init({
     flags: {
        endpoint: import.meta.env.API_GRAPHQL || "http://localhost:8080/graphql",
        token: window.localStorage.getItem('token') || "abc",
        baseUrl: ''
     }
});
