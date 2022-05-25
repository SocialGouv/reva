// @ts-ignore
import { Elm } from "../src/Main.elm";

const app = Elm.Main.init({
     flags: {
        token: (process.client && window.localStorage.getItem('token')) || "abc",
        baseUrl: '',}
});

