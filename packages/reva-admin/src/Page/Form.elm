module Page.Form exposing
    ( Element(..)
    , Form
    , Model
    , Msg
    , init
    , update
    , updateForm
    , view
    )

import Api exposing (Token)
import Data.Form.Helper exposing (booleanToString)
import Dict exposing (Dict)
import Html.Styled as Html exposing (Html, button, div, h2, input, label, option, select, text, textarea)
import Html.Styled.Attributes exposing (class, for, id, name, type_, value)
import Html.Styled.Events exposing (onCheck, onInput, onSubmit)
import RemoteData exposing (RemoteData)
import String exposing (String)
import View.Helpers exposing (dataTest)


type Msg
    = UserChangedElement String String
    | UserClickedSave
    | GotSaveResponse (RemoteData String ())
    | GotLoadResponse (RemoteData String (Dict String String))


type Element
    = Checkbox String
    | Date String
    | Empty
    | Input String
    | Number String
    | Textarea String
    | Select String (List String)
    | SelectOther String String


type alias Form =
    { elements : List ( String, Element )
    , title : String
    }


type alias FormData =
    Dict String String


type RemoteForm
    = NotAsked
    | Loading Form
    | Loaded Form FormData
    | Failure


type alias Model =
    { endpoint : String
    , onSave : Dict String String -> Cmd Msg
    , token : Token
    , filter : Maybe String
    , form : RemoteForm
    }


init :
    { endpoint : String
    , onSave : Dict String String -> Cmd Msg
    , token : Token
    , onLoad : Cmd Msg
    }
    -> ( Model, Cmd Msg )
init config =
    let
        model : Model
        model =
            { endpoint = config.endpoint
            , onSave = config.onSave
            , token = config.token
            , filter = Nothing
            , form = NotAsked
            }
    in
    ( model
    , config.onLoad
    )



-- VIEW


view : Model -> Html Msg
view model =
    let
        content =
            case model.form of
                NotAsked ->
                    text ""

                Loading form ->
                    viewForm Dict.empty form

                Loaded form formData ->
                    viewForm formData form

                Failure ->
                    text "Une erreur est survenue"
    in
    div [ class "bg-white h-full py-8 px-16" ]
        [ content ]


viewForm : FormData -> Form -> Html Msg
viewForm formData form =
    Html.form
        [ onSubmit UserClickedSave ]
        [ h2
            [ class "text-2xl font-medium text-gray-900 leading-none" ]
            [ text form.title ]
        , div
            [ class "mt-6 space-y-6" ]
          <|
            List.map (viewElement formData) form.elements
        , div
            [ class "mt-8 border-t pb-4 flex justify-end" ]
            [ button
                [ dataTest "save-description"
                , type_ "submit"
                , class "text-center mt-4 rounded bg-blue-600"
                , class "hover:bg-blue-700 text-white px-4 py-2"
                ]
                [ text "Enregistrer" ]
            ]
        ]


viewElement : FormData -> ( String, Element ) -> Html Msg
viewElement formData ( elementId, element ) =
    let
        dataOrDefault =
            Dict.get elementId formData
                |> Maybe.withDefault (defaultValue element)

        inputView dataType extraClass =
            input
                [ type_ dataType
                , name elementId
                , id elementId
                , onInput (UserChangedElement elementId)
                , class extraClass
                , class "focus:ring-blue-500 focus:border-blue-500"
                , class "mt-1 block min-w-0 rounded sm:text-sm border-gray-300"
                , value dataOrDefault
                ]
                []

        checkboxView =
            input
                [ type_ "checkbox"
                , name elementId
                , id elementId
                , onCheck (booleanToString >> UserChangedElement elementId)
                , class "focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
                , class "mt-1 block min-w-0 rounded sm:text-sm border-gray-300"
                , value dataOrDefault
                ]
                []

        textareaView =
            textarea
                [ name elementId
                , id elementId
                , onInput (UserChangedElement elementId)
                , class "shadow-sm focus:ring-blue-500 focus:border-blue-500"
                , class "block w-full sm:text-sm border-gray-300 rounded-md"
                , value dataOrDefault
                ]
                []

        labelView s =
            label
                [ for elementId
                , class "block text-sm font-medium text-gray-700"
                ]
                [ text s ]

        withLabel s el =
            div
                []
                [ labelView s
                , el
                ]
    in
    case element of
        Checkbox label ->
            div
                [ class "flex items-center h-5 w-full" ]
                [ checkboxView
                , labelView label
                ]

        Date label ->
            inputView "date" "w-36"
                |> withLabel label

        Empty ->
            text ""

        Input label ->
            inputView "text" "w-full"
                |> withLabel label

        Number label ->
            inputView "number" "w-16"
                |> withLabel label

        Textarea label ->
            textareaView
                |> withLabel label

        Select label choices ->
            select
                [ id elementId
                , onInput (UserChangedElement elementId)
                , class "mt-1 block w-full pl-3 pr-10 py-2"
                , class "text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                ]
                (List.map viewChoice choices)
                |> withLabel label

        SelectOther selectId label ->
            case Dict.get selectId formData of
                Just "Autre" ->
                    inputView "text" "w-full"
                        |> withLabel label

                Just _ ->
                    text ""

                Nothing ->
                    text ""


defaultValue : Element -> String
defaultValue element =
    case element of
        Number _ ->
            "0"

        _ ->
            ""


viewChoice : String -> Html msg
viewChoice choice =
    option [] [ text choice ]



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    let
        noChange =
            ( model, Cmd.none )
    in
    case ( msg, model.form ) of
        ( UserChangedElement elementId elementValue, Loaded form formData ) ->
            let
                newFormData =
                    Dict.insert elementId elementValue formData
            in
            ( { model | form = Loaded form newFormData }, Cmd.none )

        ( UserChangedElement _ _, _ ) ->
            noChange

        ( UserClickedSave, Loaded _ formData ) ->
            ( model, model.onSave formData )

        ( UserClickedSave, _ ) ->
            noChange


updateForm : Form -> Model -> ( Model, Cmd msg )
updateForm form model =
    ( { model | form = Loaded form Dict.empty }, Cmd.none )
