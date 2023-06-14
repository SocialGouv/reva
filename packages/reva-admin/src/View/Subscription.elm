module View.Subscription exposing (confirmRejection, confirmValidation)

import Window


confirmValidation : String -> String -> Cmd msg
confirmValidation id name =
    Window.confirmValidation
        { id = id
        , message = "Vous êtes sur le point de valider l'inscription de " ++ name
        }


confirmRejection : String -> String -> Cmd msg
confirmRejection id name =
    Window.confirmRejection
        { id = id
        , message = "Vous êtes sur le point de rejeter l'inscription de " ++ name
        }
