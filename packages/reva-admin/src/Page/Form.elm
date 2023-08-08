module Page.Form exposing
    ( Element(..)
    , Form
    , Model
    , Msg
    , Status(..)
    , empty
    , init
    , update
    , updateForm
    , view
    )

import Accessibility exposing (h1, h2, h3, h4)
import Accessibility.Aria as Aria
import Api.Token exposing (Token)
import BetaGouv.DSFR.Button as Button
import BetaGouv.DSFR.Checkbox as Checkbox
import BetaGouv.DSFR.Input as Input
import BetaGouv.DSFR.Radio as Radio
import Browser.Dom
import Data.Context exposing (Context)
import Data.Form exposing (FormData, get, insert)
import Data.Form.Helper exposing (booleanFromString, booleanToString)
import Dict exposing (Dict)
import File exposing (File)
import Html exposing (Html, div, fieldset, input, label, legend, li, option, p, select, span, text, ul)
import Html.Attributes exposing (class, disabled, for, id, multiple, name, placeholder, required, selected, title, type_, value)
import Html.Events exposing (on, onInput, onSubmit)
import Json.Decode
import List.Extra
import RemoteData exposing (RemoteData(..))
import String exposing (String)
import Task
import View


type Msg referential
    = UserChangedElement String String
    | UserClickSave referential
    | UserClickSubmit referential
    | UserSelectFiles String (List File)
    | GotSaveResponse referential (RemoteData (List String) ())
    | GotLoadResponse (RemoteData (List String) (Dict String String))
    | NoOp


type Element
    = Checkbox String
    | CheckboxWithAriaLabel String String
    | CheckboxList String (List ( String, String ))
    | Date String
    | Empty
    | File String String
    | Files String String
    | Heading String -- h2
    | Info String String
    | Input String
    | InputRequired String
    | Number String
    | Price String
    | ReadOnlyElement Element
    | ReadOnlyElements (List ( String, Element ))
    | Requirements String (List String)
    | Select String (List ( String, String ))
    | SelectOther String String String
    | Section String -- h3
    | Title String -- h4
    | Textarea String (Maybe String)
    | RadioList String (List ( String, String ))
    | Text String (Maybe String)
    | StaticHtml (Html Never)


type alias Form =
    { elements : List ( String, Element )
    , saveLabel : Maybe String
    , submitLabel : String
    , title : String -- h2
    }


type alias FormBuilder referential =
    FormData -> referential -> Form


type RemoteForm referential
    = NotAsked
    | Loading (FormBuilder referential)
    | Editing (List String) (FormBuilder referential) FormData
    | Saving (FormBuilder referential) FormData
    | Submitting (FormBuilder referential) FormData
    | Failure


type Status
    = Editable
    | ReadOnly


type alias ClickHandler referential =
    String
    -> Token
    -> (RemoteData (List String) () -> Msg referential)
    -> referential
    -> FormData
    -> Cmd (Msg referential)


type alias Model referential =
    { onRedirect : Cmd (Msg referential)
    , onSave : ClickHandler referential
    , onSubmit : ClickHandler referential
    , onValidate : referential -> FormData -> Result (List String) ()
    , form : RemoteForm referential
    , status : Status
    }


empty : Model referential
empty =
    { onRedirect = Cmd.none
    , onSave = \_ _ _ _ _ -> Cmd.none
    , onSubmit = \_ _ _ _ _ -> Cmd.none
    , onValidate = \_ _ -> Ok ()
    , form = NotAsked
    , status = ReadOnly
    }


init : ( Model referential, Cmd msg )
init =
    ( empty
    , Cmd.none
    )



-- VIEW


view : RemoteData (List String) referential -> Model referential -> Html (Msg referential)
view remoteReferential model =
    let
        submitButton label =
            Button.new { onClick = Nothing, label = label }
                |> Button.submit
                |> Button.view

        saveButton maybeLabel referential =
            case maybeLabel of
                Just label ->
                    Button.new { onClick = Just (UserClickSave referential), label = label }
                        |> Button.secondary
                        |> Button.view

                Nothing ->
                    div [] []

        disabledButton _ =
            Button.new { onClick = Nothing, label = "..." }
                |> Button.disable
                |> Button.withAttrs [ class "px-12" ]
                |> Button.view

        skeleton =
            div [ class "mt-4" ]
                [ View.skeleton "mt-8 h-8 w-96"
                , View.skeleton "mt-12 h-4 w-96"
                ]
    in
    case ( remoteReferential, model.form ) of
        ( RemoteData.NotAsked, _ ) ->
            text ""

        ( _, NotAsked ) ->
            text ""

        ( RemoteData.Loading, _ ) ->
            skeleton

        ( _, Loading _ ) ->
            skeleton

        ( RemoteData.Success referential, Saving formBuilder formData ) ->
            let
                form =
                    formBuilder formData referential
            in
            viewForm referential
                model.status
                []
                formData
                formBuilder
                (disabledButton "save")
                (submitButton form.submitLabel)

        ( RemoteData.Success referential, Submitting formBuilder formData ) ->
            let
                form =
                    formBuilder formData referential
            in
            viewForm referential
                model.status
                []
                formData
                formBuilder
                (saveButton form.saveLabel referential)
                (disabledButton "submit")

        ( RemoteData.Success referential, Editing errors formBuilder formData ) ->
            let
                form =
                    formBuilder formData referential
            in
            viewForm referential
                model.status
                errors
                formData
                formBuilder
                (saveButton form.saveLabel referential)
                (submitButton form.submitLabel)

        ( _, Failure ) ->
            text "Une erreur est survenue"

        ( RemoteData.Failure errors, _ ) ->
            View.errors errors


viewForm :
    referential
    -> Status
    -> List String
    -> FormData
    -> FormBuilder referential
    -> Html (Msg referential)
    -> Html (Msg referential)
    -> Html (Msg referential)
viewForm referential status errors formData form saveButton submitButton =
    let
        currentForm =
            form formData referential

        formFieldset content =
            Html.form
                [ class "mt-4"
                , onSubmit (UserClickSubmit referential)
                ]
                [ fieldset [ class "fr-fieldset" ] content ]
    in
    case status of
        Editable ->
            formFieldset <|
                legend
                    [ class "fr-fieldset__legend -ml-1" ]
                    [ h1 [ class "mb-1" ] [ text currentForm.title ]
                    , p [ class "font-medium text-sm text-gray-500" ]
                        [ text "Sauf mention contraire “(optionnel)” dans le label, tous les champs sont obligatoires." ]
                    ]
                    :: viewFieldsets formData currentForm.elements
                    ++ [ div
                            [ class "mt-8 pb-4 flex justify-end pr-2 w-full" ]
                            [ saveButton
                            , submitButton
                            ]
                       , View.popupErrors errors
                       ]

        ReadOnly ->
            div
                [ class "bg-gray-50 m-8 p-4" ]
            <|
                h1 [] [ text currentForm.title ]
                    :: List.map (viewReadOnlyElement formData) currentForm.elements


viewEditableElement : FormData -> ( String, Element ) -> Html (Msg referential)
viewEditableElement formData ( elementId, element ) =
    let
        dataOrDefault =
            get elementId formData
                |> Maybe.withDefault (defaultValue element)

        optional label =
            label ++ " (optionnel)"

        inputView label hint inputType inputAttrs =
            viewInput elementId label dataOrDefault
                |> inputType
                |> Input.withInputAttrs inputAttrs
                |> Input.withError (Data.Form.getError elementId formData |> Maybe.map (\e -> [ text e ]))
                |> Input.withHint [ text hint ]
                |> Input.view

        textareaView : String -> Maybe String -> Html (Msg referential)
        textareaView label placeholderValue =
            viewInput elementId (label |> optional) dataOrDefault
                |> Input.textArea (Just 10)
                |> Input.withHint [ text "Texte de description libre" ]
                |> Input.withInputAttrs [ placeholderValue |> Maybe.map placeholder |> Maybe.withDefault (class "") ]
                |> Input.view
    in
    case element of
        Checkbox label ->
            viewFieldsetElement
                [ viewCheckbox elementId label dataOrDefault
                    |> Checkbox.viewSingle
                ]

        CheckboxWithAriaLabel ariaLabel label ->
            viewFieldsetElement
                [ viewCheckbox elementId label dataOrDefault
                    |> Checkbox.singleWithInputAttrs [ Aria.label ariaLabel ]
                    |> Checkbox.viewSingle
                ]

        CheckboxList label choices ->
            viewFieldsetComplexElement
                [ (\choiceId -> get choiceId formData)
                    |> viewCheckboxList elementId label choices
                    |> Checkbox.viewGroup
                ]

        RadioList label choices ->
            viewFieldsetComplexElement
                [ get elementId formData
                    |> viewRadioList elementId label choices
                    |> Radio.view
                ]

        Date label ->
            viewFieldsetElement
                [ inputView (label |> optional) "Date au format 31/12/2022" Input.date [] ]

        Empty ->
            text ""

        File label hint ->
            [ viewInputFiles False elementId label hint ]
                |> viewFieldsetElement

        Files label hint ->
            [ viewInputFiles True elementId label hint ]
                |> viewFieldsetElement

        Heading title ->
            legend
                [ class "fr-fieldset__legend" ]
                [ h2 [] [ text title ] ]

        Title title ->
            legend
                [ class "fr-fieldset__legend mt-6 mb-1" ]
                [ h4 [] [ text title ] ]

        Input label ->
            viewFieldsetElement
                [ inputView (label |> optional) "Texte libre" identity [] ]

        InputRequired label ->
            viewFieldsetElement
                [ inputView label "Texte libre" identity [ required True ] ]

        Number label ->
            viewFieldsetElement
                [ inputView label "Un nombre entier supérieur ou égal à 0" Input.numeric [ Html.Attributes.min "0" ] ]

        Price label ->
            viewFieldsetElement
                [ inputView label "Un nombre décimal supérieur ou égal à 0" (Input.decimal 0.01) [ Html.Attributes.min "0" ] ]

        Textarea label placeholder ->
            viewFieldsetElement
                [ textareaView label placeholder ]

        Info label value ->
            div [ class "fr-fieldset__element mb-2" ] [ viewInfo label value ]

        ReadOnlyElement readOnlyElement ->
            div [ class "fr-fieldset__element mb-1" ] <|
                [ viewReadOnlyElement formData ( elementId, readOnlyElement ) ]

        ReadOnlyElements readOnlyElements ->
            div [ class "fr-fieldset__element mb-1" ] <|
                List.map
                    (viewReadOnlyElement formData)
                    readOnlyElements

        Requirements title rules ->
            let
                viewRule rule =
                    li [ class "mb-1" ] [ text rule ]
            in
            viewFieldsetElement
                [ div
                    [ class "max-w-lg bg-gray-100 px-5 py-4 rounded-lg"
                    , class "text-sm text-gray-600 mb-8"
                    ]
                    [ p [ class "text-gray-900 text-sm mb-0" ] [ text title ]
                    , ul
                        [ class "mt-3 list-disc pl-4" ]
                        (List.map viewRule rules)
                    ]
                ]

        Section title ->
            legend
                [ class "fr-fieldset__legend mt-6 mb-1" ]
                [ h3 [] [ text title ] ]

        Select label choices ->
            viewFieldsetElement
                [ div
                    [ class "fr-select-group" ]
                    [ labelView elementId "" label
                    , select
                        [ class "fr-select"
                        , id elementId
                        , onInput (UserChangedElement elementId)
                        , required True
                        ]
                        (option
                            [ disabled True
                            , selected (dataOrDefault == "")
                            , value ""
                            ]
                            [ text "Sélectionner" ]
                            :: List.map (viewChoice dataOrDefault) choices
                        )
                    ]
                ]

        SelectOther selectId otherValue label ->
            case get selectId formData of
                Just selectedValue ->
                    if selectedValue == otherValue then
                        viewFieldsetElement [ textareaView label Nothing ]

                    else
                        text ""

                Nothing ->
                    text ""

        Text content classes ->
            div [ class ("mb-4 w-full " ++ Maybe.withDefault "" classes) ] [ text content ]

        StaticHtml content ->
            div [ class "ml-2 w-full" ] [ Html.map never content ]


viewReadOnlyElement : FormData -> ( String, Element ) -> Html (Msg referential)
viewReadOnlyElement formData ( elementId, element ) =
    let
        dataOrDefault =
            get elementId formData
                |> Maybe.withDefault (defaultValue element)

        defaultView label v =
            div [] [ viewInfo label v ]
    in
    case element of
        Checkbox label ->
            viewCheckbox elementId label dataOrDefault
                |> Checkbox.singleWithDisabled True
                |> Checkbox.viewSingle

        CheckboxWithAriaLabel _ label ->
            viewCheckbox elementId label dataOrDefault
                |> Checkbox.singleWithDisabled True
                |> Checkbox.viewSingle

        CheckboxList label choices ->
            (\choiceId -> get choiceId formData)
                |> viewCheckboxList elementId label choices
                |> Checkbox.groupWithDisabled True
                |> Checkbox.viewGroup

        RadioList label choices ->
            get elementId formData
                |> viewRadioList elementId label choices
                |> Radio.withDisabled True
                |> Radio.view

        Date label ->
            defaultView label dataOrDefault

        Empty ->
            text ""

        File _ _ ->
            text ""

        Files _ _ ->
            text ""

        Heading title ->
            h2 [ class "mt-8" ] [ text title ]

        Title title ->
            h4 [ class "mt-4 mb-2" ] [ text title ]

        Info label value ->
            defaultView label value

        Input label ->
            defaultView label dataOrDefault

        InputRequired label ->
            defaultView label dataOrDefault

        Number label ->
            defaultView label dataOrDefault

        Price label ->
            defaultView label dataOrDefault

        Textarea label _ ->
            div [ class "w-full lg:w-[590px]" ] [ defaultView label dataOrDefault ]

        ReadOnlyElement readOnlyElement ->
            viewReadOnlyElement formData ( elementId, readOnlyElement )

        ReadOnlyElements readOnlyElements ->
            div [] <|
                List.map
                    (\e -> viewReadOnlyElement formData e)
                    readOnlyElements

        Requirements _ _ ->
            text ""

        Section title ->
            h3 [ class "mt-8 mb-2" ] [ text title ]

        Select label choices ->
            List.filter (\( choiceId, _ ) -> choiceId == dataOrDefault) choices
                |> List.head
                |> Maybe.map (\( _, choice ) -> viewInfo label choice)
                |> Maybe.withDefault (text "")

        SelectOther selectId otherValue label ->
            case get selectId formData of
                Just selectedValue ->
                    if selectedValue == otherValue then
                        defaultView label dataOrDefault

                    else
                        text ""

                Nothing ->
                    text ""

        Text content classes ->
            p [ class ("mb-4 " ++ Maybe.withDefault "" classes) ] [ text content ]

        StaticHtml content ->
            div [ class "ml-2" ] [ Html.map never content ]


labelView : String -> String -> String -> Html msg
labelView elementId extraClass s =
    label
        [ for elementId
        , class "fr-label"
        , class extraClass
        ]
        [ text s ]


defaultValue : Element -> String
defaultValue element =
    case element of
        Number _ ->
            "0"

        Price _ ->
            "0"

        _ ->
            ""



-- Form element views


viewInput : String -> String -> String -> Input.Config (Msg referential)
viewInput elementId label value =
    Input.new
        { onInput = UserChangedElement elementId
        , id = elementId
        , label = Accessibility.text label
        , value = value
        }


viewCheckbox : String -> String -> String -> Checkbox.Config (Msg referential)
viewCheckbox elementId label value =
    Checkbox.single
        { checked = Just (value == "checked")
        , onChecked = booleanToString >> UserChangedElement elementId
        , id = elementId
        , label = Accessibility.text label
        , value = value
        }


viewCheckboxList :
    String
    -> String
    -> List ( String, String )
    -> (String -> Maybe String)
    -> Checkbox.GroupConfig (Msg referential) ( String, String )
viewCheckboxList elementId label choices isChecked =
    let
        checkedChoices =
            List.filter
                (\( choiceId, _ ) -> isChecked choiceId |> Maybe.withDefault "false" |> booleanFromString)
                choices
    in
    Checkbox.group
        { id = elementId
        , legend = Accessibility.text label
        , onChecked = \( choiceId, _ ) bool -> UserChangedElement choiceId (booleanToString bool)
        , options = choices
        , checked = checkedChoices
        , toId = Tuple.first
        , toLabel = Tuple.second >> Accessibility.text
        , toValue = Tuple.second
        }


viewRadioList :
    String
    -> String
    -> List ( String, String )
    -> Maybe String
    -> Radio.GroupConfig (Msg referential) ( String, String )
viewRadioList elementId label choices current =
    let
        findOption option =
            List.Extra.find (Tuple.second >> (==) option) choices
    in
    Radio.group
        { id = elementId
        , legend = Accessibility.text label
        , onChecked = \( _, option ) -> UserChangedElement elementId option
        , options = choices
        , current = current |> Maybe.andThen findOption
        , toId = Tuple.first
        , toLabel = Tuple.second >> Accessibility.text
        , toValue = Tuple.second
        }
        |> Radio.inline


viewChoice : String -> ( String, String ) -> Html msg
viewChoice currentChoiceId ( choiceId, choice ) =
    option
        [ selected (choiceId == currentChoiceId), value choiceId ]
        [ text choice ]


viewInputFiles : Bool -> String -> String -> String -> Html (Msg referential)
viewInputFiles acceptMultipleFiles elementId title hint =
    let
        filesDecoder : Json.Decode.Decoder (List File)
        filesDecoder =
            Json.Decode.at [ "target", "files" ] (Json.Decode.list File.decoder)
    in
    div
        [ class "fr-upload-group" ]
        [ label
            [ class "fr-label"
            , for elementId
            ]
            [ text title
            , span
                [ class "fr-hint-text"
                ]
                [ text hint ]
            ]
        , input
            [ class "fr-upload w-full lg:w-[520px]"
            , type_ "file"
            , multiple acceptMultipleFiles
            , id elementId
            , name elementId
            , on "change" (Json.Decode.map (UserSelectFiles elementId) filesDecoder)
            ]
            []
        ]


viewInfo : String -> String -> Html msg
viewInfo s d =
    div [ class "text-lg" ]
        [ if s /= "" then
            label [] [ text s, text " : " ]

          else
            text ""
        , span [] [ text d ]
        ]



-- Fieldsets view


{-| Group common form elements into fieldsets for better accessibility

Example:

    fieldset
        [ h2, h3, h4, element a, h4, element b, element c, h3, element d, element e ]

    Becomes:

    fieldset
        [ h2
        , element
            [ fieldset
                [ h3
                , element
                    [ fieldset
                        [ h4
                        , element a
                        ]
                    ]
                , element
                    [ fieldset
                        [ h4
                        , element b
                        , element c
                        ]
                    ]
                ]
            ]
        , element
            [ fieldset
                [ h3
                , element d
                , element e
                ]
            ]
        ]

-}
viewFieldsets : FormData -> List ( String, Element ) -> List (Html (Msg referential))
viewFieldsets formData elements =
    let
        wrapWithElement : List (Html msg) -> List (Html msg)
        wrapWithElement l =
            List.map (\e -> viewFieldsetElement [ e ]) l

        wrapWithGrayElement : List (Html msg) -> List (Html msg)
        wrapWithGrayElement l =
            List.map
                (\e ->
                    div
                        [ class "fr-fieldset__element"
                        , class "mt-0 mb-4 pt-4 px-6 ml-2 bg-neutral-100"
                        ]
                        [ e ]
                )
                l

        viewFieldset : Int -> List (Html msg) -> Html msg
        viewFieldset level content =
            fieldset
                [ class "fr-fieldset mb-2"
                ]
                content

        groupHelper :
            ( String, Element )
            ->
                { l1 : List (Html (Msg referential))
                , l2 : List (Html (Msg referential))
                , l3 : List (Html (Msg referential))
                , elements : List (Html (Msg referential))
                }
            ->
                { l1 : List (Html (Msg referential))
                , l2 : List (Html (Msg referential))
                , l3 : List (Html (Msg referential))
                , elements : List (Html (Msg referential))
                }
        groupHelper element acc =
            let
                htmlElement =
                    viewEditableElement formData element
            in
            case isNewGroup element of
                Just 1 ->
                    { acc
                        | l1 =
                            viewFieldset 1
                                (htmlElement
                                    :: acc.elements
                                    ++ wrapWithGrayElement acc.l3
                                    ++ wrapWithElement acc.l2
                                )
                                :: acc.l1
                        , l2 = []
                        , l3 = []
                        , elements = []
                    }

                Just 2 ->
                    { acc
                        | l2 =
                            viewFieldset 2
                                (htmlElement
                                    :: acc.elements
                                    ++ wrapWithGrayElement acc.l3
                                )
                                :: acc.l2
                        , l3 = []
                        , elements = []
                    }

                Just 3 ->
                    { acc
                        | l3 = viewFieldset 3 (htmlElement :: acc.elements) :: acc.l3
                        , elements = []
                    }

                Just _ ->
                    acc

                Nothing ->
                    { acc | elements = htmlElement :: acc.elements }

        isNewGroup : ( String, Element ) -> Maybe Int
        isNewGroup ( _, element ) =
            case element of
                Heading _ ->
                    Just 1

                Section _ ->
                    Just 2

                Title _ ->
                    Just 3

                _ ->
                    Nothing

        groupedElements =
            List.foldr groupHelper { l1 = [], l2 = [], l3 = [], elements = [] } elements
    in
    groupedElements.elements
        ++ wrapWithGrayElement groupedElements.l3
        ++ wrapWithElement groupedElements.l2
        ++ wrapWithElement groupedElements.l1


{-| Wrap a complex element that already have internal margins, like radio or checkbox list
-}
viewFieldsetComplexElement : List (Html msg) -> Html msg
viewFieldsetComplexElement =
    div [ class "fr-fieldset__element mt-2 -mb-3" ]


{-| Wrap a simple element like input or textarea
-}
viewFieldsetElement : List (Html msg) -> Html msg
viewFieldsetElement =
    div [ class "fr-fieldset__element" ]



-- UPDATE


update : Context -> Msg referential -> Model referential -> ( Model referential, Cmd (Msg referential) )
update context msg model =
    let
        noChange =
            ( model, Cmd.none )

        clickHandler handler validate toMsg state referential form formData =
            case validate referential formData of
                Err errors ->
                    ( { model | form = Editing errors form formData }, Cmd.none )

                Ok () ->
                    ( { model | form = state form formData }
                    , handler context.endpoint context.token toMsg referential formData
                    )

        inputErrorPredicate =
            String.startsWith "input."

        inputErrors errors =
            List.filter inputErrorPredicate errors
                |> List.map (String.dropLeft 6)

        globalErrors errors =
            List.filter (not << inputErrorPredicate) errors

        focusOnFirstInputError : Form -> FormData -> Cmd (Msg referential)
        focusOnFirstInputError form formData =
            case Data.Form.getFirstError form.elements formData of
                Just firstError ->
                    Task.attempt (\_ -> NoOp) (Browser.Dom.focus ("input-" ++ firstError))

                Nothing ->
                    Cmd.none

        handleFailure :
            List String
            -> (FormData -> referential -> Form)
            -> FormData
            -> referential
            -> ( Model referential, Cmd (Msg referential) )
        handleFailure errors form formData referential =
            let
                keys =
                    (form formData referential).elements
                        |> List.map Tuple.first

                newFormData =
                    Data.Form.withErrors keys formData (inputErrors errors)
            in
            ( { model | form = Editing (globalErrors errors) form newFormData }
            , focusOnFirstInputError (form newFormData referential) newFormData
            )
    in
    case ( msg, model.form ) of
        ( UserChangedElement elementId elementValue, Editing _ form formData ) ->
            let
                newFormData =
                    insert elementId elementValue formData
            in
            ( { model | form = Editing [] form newFormData }, Cmd.none )

        ( UserChangedElement _ _, _ ) ->
            noChange

        ( UserClickSave referential, Editing _ form formData ) ->
            clickHandler model.onSave (\_ _ -> Ok ()) (GotSaveResponse referential) Saving referential form formData

        ( UserClickSave _, _ ) ->
            noChange

        ( UserClickSubmit referential, Editing _ form formData ) ->
            clickHandler model.onSubmit model.onValidate (GotSaveResponse referential) Submitting referential form formData

        ( UserClickSubmit _, _ ) ->
            noChange

        ( UserSelectFiles key files, Editing errors form formData ) ->
            let
                fileNames =
                    List.map File.name files

                filesWithNames =
                    List.Extra.zip fileNames files
            in
            ( { model | form = Editing errors form (Data.Form.insertFiles key filesWithNames formData) }
            , Cmd.none
            )

        ( UserSelectFiles _ _, _ ) ->
            noChange

        ( GotLoadResponse (RemoteData.Success dict), Loading form ) ->
            ( { model | form = Editing [] form (Data.Form.fromDict dict) }, Cmd.none )

        ( GotLoadResponse (RemoteData.Failure _), Loading form ) ->
            ( { model | form = Failure }, Cmd.none )

        ( GotLoadResponse _, _ ) ->
            noChange

        ( GotSaveResponse _ (RemoteData.Success _), _ ) ->
            ( model
            , Cmd.batch
                [ Task.perform (\_ -> NoOp) (Browser.Dom.setViewport 0 0)
                , model.onRedirect
                ]
            )

        ( GotSaveResponse referential (RemoteData.Failure errors), Saving form formData ) ->
            handleFailure errors form formData referential

        ( GotSaveResponse referential (RemoteData.Failure errors), Submitting form formData ) ->
            handleFailure errors form formData referential

        ( GotSaveResponse _ _, _ ) ->
            noChange

        ( NoOp, _ ) ->
            noChange


updateForm :
    Context
    ->
        { form : FormData -> referential -> Form
        , onLoad : Maybe (String -> Token -> (RemoteData (List String) (Dict String String) -> Msg referential) -> Cmd (Msg referential))
        , onRedirect : Cmd (Msg referential)
        , onSubmit : ClickHandler referential
        , onSave : Maybe (ClickHandler referential)
        , onValidate : referential -> FormData -> Result (List String) ()
        , status : Status
        }
    -> Model referential
    -> ( Model referential, Cmd (Msg referential) )
updateForm context config model =
    ( { model
        | form =
            config.onLoad
                |> Maybe.map (always (Loading config.form))
                |> Maybe.withDefault (Editing [] config.form Data.Form.empty)
        , onRedirect = config.onRedirect
        , onSave = config.onSave |> Maybe.withDefault (\_ _ _ _ _ -> Cmd.none)
        , onSubmit = config.onSubmit
        , onValidate = config.onValidate
        , status = config.status
      }
    , config.onLoad
        |> Maybe.map (\loader -> loader context.endpoint context.token GotLoadResponse)
        |> Maybe.withDefault Cmd.none
    )
