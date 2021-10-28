module Page.Login exposing (Field(..), Model, init, validateLogin, view, withErrors)

import Html.Styled exposing (Html, a, button, div, form, h2, img, input, label, span, text)
import Html.Styled.Attributes exposing (alt, checked, class, for, href, id, name, novalidate, placeholder, src, type_, value)
import Html.Styled.Events exposing (onClick, onInput, onSubmit)
import Route exposing (Route(..))
import Svg.Styled exposing (path, svg)
import Svg.Styled.Attributes exposing (clipRule, d, fill, fillRule, viewBox)
import Validate exposing (Validator, ifBlank, ifInvalidEmail, validate)
import View.Form as Form
import View.Label as Label


type alias LoginForm =
    { email : String
    , password : String
    , rememberMe : Bool
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
        , rememberMe = False
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
    div [ class "min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50" ]
        [ div [ class "sm:mx-auto sm:w-full sm:max-w-md" ]
            [ img [ class "mx-auto h-12 w-auto", src "/illustrations/beta-gouv-logo-a3.png", alt "REVA" ]
                []
            , h2 [ class "mt-6 text-center text-3xl font-extrabold text-gray-900" ]
                [ text "REVA" ]
            ]
        , div [ class "mt-8 sm:mx-auto sm:w-full sm:max-w-md" ]
            [ div [ class "bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10" ]
                [ form [ onSubmit events.onSubmit, novalidate True, class "space-y-6" ]
                    [ Form.getMaybeError Global model.errors
                        |> Maybe.map (\error -> div [] [ Label.error error ])
                        |> Maybe.withDefault (text "")
                    , div []
                        [ label [ for "email", class "block text-sm font-medium text-gray-700" ]
                            [ text "Adresse email" ]
                        , div [ class "mt-1" ]
                            [ input
                                [ id "email"
                                , name "email"
                                , type_ "email"
                                , class "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                , placeholder "john.doe@monentreprise.fr"
                                , value model.form.email
                                , onInput (\value -> events.onUpdateModel (withEmail model value))
                                ]
                                []
                            , Form.getError Email model.errors
                            ]
                        ]
                    , div []
                        [ label [ for "password", class "block text-sm font-medium text-gray-700" ]
                            [ text "Mot de passe" ]
                        , div [ class "mt-1" ]
                            [ input
                                [ id "password"
                                , name "password"
                                , type_ "password"
                                , class "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                , placeholder "mot_de_passe"
                                , value model.form.password
                                , onInput (\value -> events.onUpdateModel (withPassword model value))
                                ]
                                []
                            , Form.getError Password model.errors
                            ]
                        ]
                    , div [ class "flex items-center justify-between" ]
                        [ div [ class "flex items-center" ]
                            [ input
                                [ id "remember-me"
                                , name "remember-me"
                                , type_ "checkbox"
                                , class "h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                , checked model.form.rememberMe
                                , onClick (withToggleRememberMe model |> events.onUpdateModel)
                                ]
                                []
                            , label [ for "remember-me", class "ml-2 block text-sm text-gray-900" ]
                                [ text "Se souvenir de moi" ]
                            ]
                        ]
                    , div []
                        [ button
                            [ type_ "submit"
                            , class "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            ]
                            [ text "Se connecter" ]
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
    { model | form = newForm, errors = [] }


withPassword : Model -> String -> Model
withPassword model password =
    let
        currentForm =
            model.form

        newForm =
            { currentForm | password = password }
    in
    { model | form = newForm, errors = [] }


withToggleRememberMe : Model -> Model
withToggleRememberMe model =
    let
        currentForm =
            model.form

        newForm =
            { currentForm | rememberMe = not currentForm.rememberMe }
    in
    { model | form = newForm }


withErrors : Model -> List ( Field, String ) -> Model
withErrors model errors =
    { model | errors = errors }


modelValidator : Validator ( Field, String ) LoginForm
modelValidator =
    Validate.all
        [ ifInvalidEmail .email (\_ -> ( Email, "Veuillez renseigner une adresse email valide." ))
        , ifBlank .password ( Password, "Veuillez renseigner votre mot de passe." )
        ]


validateLogin : Model -> Result (List ( Field, String )) (Validate.Valid LoginForm)
validateLogin =
    validate modelValidator << .form
