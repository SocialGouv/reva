// @ts-ignore
import { Elm } from "../src/Main.elm";

console.log(process.env.API_GRAPHQL)

const app = Elm.Main.init({
     flags: {
        endpoint: process.env.API_GRAPHQL || "http://localhost:8080/graphql",
        token: (process.client && window.localStorage.getItem('token')) || "abc",
        baseUrl: ''
     }
});

