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
import Html.Styled.Attributes exposing (checked, class, disabled, for, id, name, selected, step, type_, value)
import Html.Styled.Events exposing (onCheck, onInput, onSubmit)
import RemoteData exposing (RemoteData(..))
import String exposing (String)
import View.Helpers exposing (dataTest)


type Msg
    = UserChangedElement String String
    | UserClickedSave
    | GotSaveResponse (RemoteData String ())
    | GotLoadResponse (RemoteData String (Dict String String))


type Element
    = Checkbox String
    | CheckboxList String (List String)
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
    | Editing Form FormData
    | Saving Form FormData
    | Failure


type alias Model =
    { endpoint : String
    , onRedirect : Cmd Msg
    , onSave : (RemoteData String () -> Msg) -> Dict String String -> Cmd Msg
    , token : Token
    , filter : Maybe String
    , form : RemoteForm
    }


init : String -> Token -> ( Model, Cmd msg )
init endpoint token =
    let
        model : Model
        model =
            { endpoint = endpoint
            , onRedirect = Cmd.none
            , onSave = \_ _ -> Cmd.none
            , token = token
            , filter = Nothing
            , form = NotAsked
            }
    in
    ( model
    , Cmd.none
    )



-- VIEW


view : Model -> Html Msg
view model =
    let
        saveButton label =
            button
                [ dataTest "save-description"
                , type_ "submit"
                , class "text-center mt-4 rounded bg-blue-600"
                , class "hover:bg-blue-700 text-white px-4 py-2"
                ]
                [ text label ]

        disabledSaveButton label =
            button
                [ dataTest "save-description"
                , disabled True
                , type_ "submit"
                , class "text-center mt-4 rounded bg-blue-400"
                , class "text-white px-4 py-2"
                ]
                [ text label ]

        content =
            case model.form of
                NotAsked ->
                    text ""

                Loading _ ->
                    text "..."

                Saving form formData ->
                    viewForm formData form <|
                        disabledSaveButton "Enregistrement..."

                Editing form formData ->
                    viewForm formData form <|
                        saveButton "Enregistrer"

                Failure ->
                    text "Une erreur est survenue"
    in
    div [ class "bg-white h-full py-8 px-16" ]
        [ content ]


viewForm : FormData -> Form -> Html Msg -> Html Msg
viewForm formData form saveButton =
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
            [ saveButton
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
                , checked (dataOrDefault == "checked")
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

        CheckboxList label choices ->
            -- TODO
            div
                [ class "flex items-center h-5 w-full" ]
                -- TODO: display one checkbox for each choice
                [ text <| String.join ", " choices
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
            inputView "number" "w-20"
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
                (List.map (viewChoice dataOrDefault) choices)
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


viewChoice : String -> String -> Html msg
viewChoice currentValue choice =
    option [ selected (choice == currentValue) ] [ text choice ]



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    let
        noChange =
            ( model, Cmd.none )
    in
    case ( msg, model.form ) of
        ( UserChangedElement elementId elementValue, Editing form formData ) ->
            let
                newFormData =
                    Dict.insert elementId elementValue formData
            in
            ( { model | form = Editing form newFormData }, Cmd.none )

        ( UserChangedElement _ _, _ ) ->
            noChange

        ( UserClickedSave, Editing form formData ) ->
            ( { model | form = Saving form formData }, model.onSave GotSaveResponse formData )

        ( UserClickedSave, _ ) ->
            noChange

        ( GotLoadResponse (RemoteData.Success formData), Loading form ) ->
            ( { model | form = Editing form formData }, Cmd.none )

        ( GotLoadResponse (RemoteData.Failure _), Loading form ) ->
            ( { model | form = Failure }, Cmd.none )

        ( GotLoadResponse _, _ ) ->
            noChange

        ( GotSaveResponse (RemoteData.Success _), Saving form formData ) ->
            ( { model | form = Editing form formData }, model.onRedirect )

        ( GotSaveResponse (RemoteData.Failure _), Editing _ _ ) ->
            -- TODO: Handle save failure
            noChange

        ( GotSaveResponse _, _ ) ->
            noChange


updateForm :
    { form : Form
    , onLoad : (RemoteData String (Dict String String) -> Msg) -> Cmd Msg
    , onRedirect : Cmd Msg
    , onSave : (RemoteData String () -> Msg) -> Dict String String -> Cmd Msg
    }
    -> Model
    -> ( Model, Cmd Msg )
updateForm config model =
    ( { model
        | form = Loading config.form
        , onRedirect = config.onRedirect
        , onSave = config.onSave
      }
    , config.onLoad GotLoadResponse
    )
