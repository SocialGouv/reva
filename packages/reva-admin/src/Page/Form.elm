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
import Html.Styled as Html exposing (Html, button, div, fieldset, h2, input, label, legend, option, select, text, textarea)
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
    | CheckboxList String (List ( String, String ))
    | Date String
    | Empty
    | Input String
    | Number String
    | Textarea String
    | Select String (List ( String, String ))
    | SelectOther String String


type alias Form referential =
    { elements : referential -> List ( String, Element )
    , title : String
    }


type alias FormData =
    Dict String String


type RemoteForm referential
    = NotAsked
    | Loading (Form referential)
    | Editing (Form referential) FormData
    | Saving (Form referential) FormData
    | Failure


type alias Model referential =
    { endpoint : String
    , onRedirect : Cmd Msg
    , onSave : (RemoteData String () -> Msg) -> Dict String String -> Cmd Msg
    , token : Token
    , filter : Maybe String
    , form : RemoteForm referential
    }


init : String -> Token -> ( Model referential, Cmd msg )
init endpoint token =
    let
        model : Model referential
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


view : RemoteData String referential -> Model referential -> Html Msg
view remoteReferential model =
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
            case ( remoteReferential, model.form ) of
                ( RemoteData.NotAsked, _ ) ->
                    text ""

                ( _, NotAsked ) ->
                    text ""

                ( RemoteData.Loading, _ ) ->
                    text "..."

                ( _, Loading _ ) ->
                    text "..."

                ( RemoteData.Success referential, Saving form formData ) ->
                    viewForm referential formData form <|
                        disabledSaveButton "Enregistrement..."

                ( RemoteData.Success referential, Editing form formData ) ->
                    viewForm referential formData form <|
                        saveButton "Enregistrer"

                ( _, Failure ) ->
                    text "Une erreur est survenue"

                ( RemoteData.Failure err, _ ) ->
                    text err
    in
    div [ class "bg-white h-full py-8 px-16" ]
        [ content ]


viewForm : referential -> FormData -> Form referential -> Html Msg -> Html Msg
viewForm referential formData form saveButton =
    Html.form
        [ onSubmit UserClickedSave ]
        [ h2
            [ class "text-4xl font-medium text-gray-900 leading-none mb-12" ]
            [ text form.title ]
        , div
            [ class "mt-6 space-y-10" ]
          <|
            List.map (viewElement formData) <|
                form.elements referential
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

        inputStyle =
            String.join " "
                [ "border-b-[3px] border-0 border-b-gray-900"
                , "focus:ring-blue-500 focus:ring-0 focus:border-blue-600"
                , "text-xl placeholder:text-gray-500"
                , "block bg-gray-100 pl-8"
                ]
                |> class

        inputView dataType extraClass =
            input
                [ type_ dataType
                , name elementId
                , id elementId
                , onInput (UserChangedElement elementId)
                , class extraClass
                , class "min-w-0 h-[85px] pr-4"
                , inputStyle
                , value dataOrDefault
                ]
                []

        checkboxView =
            input
                [ type_ "checkbox"
                , name elementId
                , id elementId
                , onCheck (booleanToString >> UserChangedElement elementId)
                , class "focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-400 rounded mr-4"
                , class "mt-1 block min-w-0 rounded sm:text-sm border-gray-300"
                , checked (dataOrDefault == "checked")
                ]
                []

        textareaView =
            textarea
                [ name elementId
                , id elementId
                , onInput (UserChangedElement elementId)
                , class "w-full pr-8 h-[150px]"
                , inputStyle
                , value dataOrDefault
                ]
                []

        labelView extraClass s =
            label
                [ for elementId
                , class "block"
                , class extraClass
                ]
                [ text s ]

        withLegend s el =
            fieldset
                []
                [ legend [ class "text-lg font-semibold text-gray-900 mt-8 mb-4" ] [ text s ]
                , el
                ]

        withLabel s el =
            div
                []
                [ labelView "text-lg font-semibold text-gray-900 mb-4" s
                , el
                ]
    in
    case element of
        Checkbox label ->
            div
                [ class "flex items-start h-8 w-full" ]
                [ checkboxView
                , labelView "text-base" label
                ]

        CheckboxList label choices ->
            let
                viewChoices =
                    List.map
                        (\( choiceId, choice ) -> viewElement formData ( choiceId, Checkbox choice ))
                        choices
            in
            div
                [ name elementId
                , id elementId
                , class "mt-1"
                ]
                viewChoices
                |> withLegend label

        Date label ->
            inputView "date" "w-60"
                |> withLabel label

        Empty ->
            text ""

        Input label ->
            inputView "text" "w-full"
                |> withLabel label

        Number label ->
            inputView "number" "w-40"
                |> withLabel label

        Textarea label ->
            textareaView
                |> withLabel label

        Select label choices ->
            select
                [ id elementId
                , onInput (UserChangedElement elementId)
                , class "mt-1 block w-full h-[85px] pr-10"
                , inputStyle
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


viewChoice : String -> ( String, String ) -> Html msg
viewChoice currentChoiceId ( choiceId, choice ) =
    option
        [ selected (choiceId == currentChoiceId), value choiceId ]
        [ text choice ]



-- UPDATE


update : Msg -> Model referential -> ( Model referential, Cmd Msg )
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
    { form : Form referential
    , onLoad : (RemoteData String (Dict String String) -> Msg) -> Cmd Msg
    , onRedirect : Cmd Msg
    , onSave : (RemoteData String () -> Msg) -> Dict String String -> Cmd Msg
    }
    -> Model referential
    -> ( Model referential, Cmd Msg )
updateForm config model =
    ( { model
        | form = Loading config.form
        , onRedirect = config.onRedirect
        , onSave = config.onSave
      }
    , config.onLoad GotLoadResponse
    )
