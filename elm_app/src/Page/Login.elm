module Page.Login exposing (Model, init, validateLogin, view)

import Html.Styled exposing (Html, a, button, div, form, h2, img, input, label, span, text)
import Html.Styled.Attributes exposing (alt, class, for, href, id, name, novalidate, placeholder, src, type_, value)
import Html.Styled.Events exposing (onInput, onSubmit)
import Route exposing (Route(..))
import Svg.Styled exposing (path, svg)
import Svg.Styled.Attributes exposing (clipRule, d, fill, fillRule, viewBox)
import Validate exposing (Validator, ifBlank, ifInvalidEmail, validate)


type alias LoginForm =
    { email : String
    , password : String
    }


type alias Model =
    { form : LoginForm
    , errors : List ( Field, String )
    , isSubmitting : Bool
    }


type Field
    = Email
    | Password
    | Global


init : Model
init =
    { form =
        { email = ""
        , password = ""
        }
    , errors = []
    , isSubmitting = False
    }


type alias Events msg =
    { onSubmit : msg
    , onUpdateModel : Model -> msg
    }


view : Events msg -> Model -> Html msg
view events model =
    div [ class "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" ]
        [ div [ class "max-w-md w-full space-y-8" ]
            [ div []
                [ img [ class "mx-auto h-12 w-auto", src "/workflow-mark-indigo-600.svg", alt "Workflow" ]
                    []
                , h2 [ class "mt-6 text-center text-3xl font-extrabold text-gray-900" ]
                    [ text "Login" ]
                ]
            , form [ onSubmit events.onSubmit, novalidate True, class "mt-8 space-y-6" ]
                [ input [ type_ "hidden", name "remember", value "true" ]
                    []
                , div [ class "rounded-md shadow-sm -space-y-px" ]
                    [ div []
                        [ label [ for "email-address", class "sr-only" ]
                            [ text "Email address" ]
                        , input
                            [ id "email-address"
                            , name "email"
                            , type_ "email"
                            , class "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            , placeholder "Email address"
                            , value model.form.email
                            , onInput (\value -> events.onUpdateModel (withEmail model value))
                            ]
                            []
                        ]
                    , div []
                        [ label [ for "password", class "sr-only" ]
                            [ text "Password" ]
                        , input
                            [ id "password"
                            , name "password"
                            , type_ "password"
                            , class "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            , placeholder "Password"
                            , value model.form.password
                            , onInput (\value -> events.onUpdateModel (withPassword model value))
                            ]
                            []
                        ]
                    ]
                , div [ class "flex items-center justify-between" ]
                    [ div [ class "flex items-center" ]
                        [ input
                            [ id "remember-me"
                            , name "remember-me"
                            , type_ "checkbox"
                            , class "h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            ]
                            []
                        , label [ for "remember-me", class "ml-2 block text-sm text-gray-900" ]
                            [ text "Remember me" ]
                        ]
                    , div [ class "text-sm" ]
                        [ a [ href "#", class "font-medium text-indigo-600 hover:text-indigo-500" ]
                            [ text "Forgot your password?" ]
                        ]
                    ]
                , div []
                    [ button [ type_ "submit", class "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" ]
                        [ span [ class "absolute left-0 inset-y-0 flex items-center pl-3" ]
                            [ svg [ Svg.Styled.Attributes.class "h-5 w-5 text-indigo-500 group-hover:text-indigo-400", viewBox "0 0 20 20", fill "currentColor" ]
                                [ path [ fillRule "evenodd", d "M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z", clipRule "evenodd" ]
                                    []
                                ]
                            ]
                        , text "Sign in"
                        ]
                    ]
                ]
            ]
        ]


withEmail : Model -> String -> Model
withEmail model email =
    let
        currentForm =
            model.form

        newForm =
            { currentForm | email = email }
    in
    { model | form = newForm }


withPassword : Model -> String -> Model
withPassword model password =
    let
        currentForm =
            model.form

        newForm =
            { currentForm | password = password }
    in
    { model | form = newForm }


modelValidator : Validator ( Field, String ) LoginForm
modelValidator =
    Validate.all
        [ ifInvalidEmail .email (\_ -> ( Email, "Please enter a valid email address." ))
        , ifBlank .password ( Password, "Please enter a password." )
        ]


validateLogin : Model -> Result (List ( Field, String )) (Validate.Valid LoginForm)
validateLogin =
    validate modelValidator << .form
