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

import Accessibility exposing (h1, h2, h3, h4, h5, hr)
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
import Html exposing (Html, div, fieldset, input, label, legend, li, option, p, span, text, ul)
import Html.Attributes exposing (class, for, id, multiple, name, placeholder, required, title, type_, value)
import Html.Events exposing (on, onSubmit)
import Json.Decode
import List.Extra
import RemoteData exposing (RemoteData(..))
import String exposing (String)
import Task
import View
import View.Form exposing (viewLabel, viewSelect)


type Msg referential
    = UserChangedElement String String
    | UserClickSave referential
    | UserClickSubmit referential
    | UserSelectFiles String (List File)
    | GotSaveResponse referential (RemoteData (List String) ())
    | GotLoadResponse (RemoteData (List String) (Dict String String))
    | NoOp


type Element
    = BreakToplevel
    | Break
    | Checkbox String
    | CheckboxWithAriaLabel String String
    | CheckboxList String (List ( String, String ))
    | Date String
    | Empty
    | File String String
    | FileRequired String String
    | Files String String
    | Title1 String -- h3
    | Title2 String -- h4
    | Title3 String -- h5
    | TitleInlined String -- h5
    | Info String String
    | Input String
    | InputRequired String
    | EmailRequired String
    | Number String
    | Price String
    | HourCount String
    | ReadOnlyElement Element
    | ReadOnlyElements (List ( String, Element ))
    | Requirements String (List String)
    | Select String (List ( String, String ))
    | SelectOther String String String
    | Textarea String (Maybe String) Bool
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
                [ class "w-full mb-4"
                , onSubmit (UserClickSubmit referential)
                ]
                [ fieldset [] content ]

        containsInfoElement =
            List.length currentForm.elements == 1 && List.Extra.find (\( value, _ ) -> value == "info") currentForm.elements /= Nothing

        formTitle =
            if currentForm.title == "" then
                text ""

            else
                h1 [ class "text-dsfrBlack-500 text-4xl mb-1" ] [ text currentForm.title ]
    in
    case status of
        Editable ->
            formFieldset <|
                legend
                    [ class "mb-4" ]
                    [ formTitle
                    , if List.isEmpty currentForm.elements || containsInfoElement then
                        text ""

                      else
                        p [ class "text-gray-600 mb-2" ]
                            [ text "Sauf mention contraire “(optionnel)” dans le label, tous les champs sont obligatoires." ]
                    ]
                    :: viewFieldsets viewEditableElement formData currentForm.elements
                    ++ [ div
                            [ class "mt-8 pb-4 flex justify-end w-full" ]
                            [ saveButton
                            , submitButton
                            ]
                       , View.popupErrors errors
                       ]

        ReadOnly ->
            div
                [ class "mb-24" ]
            <|
                formTitle
                    :: viewFieldsets viewReadOnlyElement formData currentForm.elements


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

        textareaView : String -> Maybe String -> Bool -> Html (Msg referential)
        textareaView label placeholderValue isRequired =
            viewInput elementId
                (if isRequired then
                    label

                 else
                    label |> optional
                )
                dataOrDefault
                |> Input.textArea (Just 6)
                |> Input.withHint [ text "Texte de description libre" ]
                |> Input.withInputAttrs [ placeholderValue |> Maybe.map placeholder |> Maybe.withDefault (class ""), required isRequired ]
                |> Input.view
    in
    case element of
        BreakToplevel ->
            div [ class "w-full" ] []

        Break ->
            div [ class "w-full" ] []

        Checkbox label ->
            div [ class "mb-8" ]
                [ viewCheckbox elementId label dataOrDefault
                    |> Checkbox.viewSingle
                ]

        CheckboxWithAriaLabel ariaLabel label ->
            div [ class "mb-8" ]
                [ viewCheckbox elementId label dataOrDefault
                    |> Checkbox.singleWithInputAttrs [ Aria.label ariaLabel ]
                    |> Checkbox.viewSingle
                ]

        CheckboxList label choices ->
            let
                extraClass =
                    if List.length choices == 1 then
                        "w-full"

                    else
                        View.Form.listElement50percentClass
            in
            viewFieldsetComplexElement extraClass
                [ (\choiceId -> get choiceId formData)
                    |> viewCheckboxList elementId label choices
                    |> Checkbox.viewGroup
                ]

        RadioList label choices ->
            viewFieldsetComplexElement View.Form.listElement50percentClass
                [ get elementId formData
                    |> viewRadioList elementId label choices
                    |> Radio.view
                ]

        Date label ->
            viewFieldsetElement
                [ inputView label "Date au format 31/12/2022" Input.date [] ]

        Empty ->
            text ""

        File label hint ->
            viewInputFiles False elementId label hint False

        FileRequired label hint ->
            viewInputFiles False elementId label hint True

        Files label hint ->
            viewInputFiles True elementId label hint False

        Title1 title ->
            legend
                [ class "w-full border-t pt-6" ]
                [ h2 [ class "text-xl" ] [ text title ] ]

        Title2 title ->
            legend
                []
                [ viewTitle2 title ]

        Title3 title ->
            legend [] [ viewTitle3 title ]

        TitleInlined title ->
            View.Form.column27percent
                []
                [ h4
                    [ class "text-base font-normal h-10 lg:pr-2" ]
                    [ text title ]
                ]

        Input label ->
            viewFieldsetElement
                [ inputView (label |> optional) "" identity [] ]

        InputRequired label ->
            viewFieldsetElement
                [ inputView label "" identity [ required True ] ]

        EmailRequired label ->
            viewFieldsetElement
                [ inputView label "" Input.email [ required True ] ]

        Number label ->
            viewFieldsetElement
                [ inputView label "Un entier supérieur ou égal à 0" Input.numeric [ Html.Attributes.min "0" ] ]

        Price label ->
            viewFieldsetElement
                [ inputView label "Un décimal supérieur ou égal à 0" (Input.decimal 0.01) [ Html.Attributes.min "0" ] ]

        HourCount label ->
            viewFieldsetElement
                [ inputView label "Exemple : saisir 2,5 pour 2h30" (Input.decimal 0.5) [ Html.Attributes.min "0" ] ]

        Textarea label placeholder isRequired ->
            View.Form.column50percent [ class "mb-6" ] [ textareaView label placeholder isRequired ]

        Info label value ->
            viewInfo elementId label value

        ReadOnlyElement readOnlyElement ->
            viewReadOnlyElement formData ( elementId, readOnlyElement )

        ReadOnlyElements readOnlyElements ->
            div [ class "flex flex-wrap gap-x-4" ] <|
                List.map
                    (viewReadOnlyElement formData)
                    readOnlyElements

        Requirements title rules ->
            let
                viewRule rule =
                    li [ class "mb-1" ] [ text rule ]
            in
            div
                [ class "max-w-lg bg-gray-100 px-5 py-4 rounded-lg"
                , class "text-sm text-gray-600 mb-8"
                ]
                [ p [ class "text-gray-900 text-sm mb-0" ] [ text title ]
                , ul
                    [ class "mt-3 list-disc pl-4" ]
                    (List.map viewRule rules)
                ]

        Select label choices ->
            viewSelect { elementId = elementId, label = label, dataOrDefault = dataOrDefault, choices = choices, onInputMsg = UserChangedElement }

        SelectOther selectId otherValue label ->
            case get selectId formData of
                Just selectedValue ->
                    if selectedValue == otherValue then
                        viewFieldsetElement [ textareaView label Nothing False ]

                    else
                        text ""

                Nothing ->
                    text ""

        Text content classes ->
            div [ class ("mb-4 w-full " ++ Maybe.withDefault "" classes) ] [ text content ]

        StaticHtml content ->
            Html.map never content


viewReadOnlyElement : FormData -> ( String, Element ) -> Html (Msg referential)
viewReadOnlyElement formData ( elementId, element ) =
    let
        dataOrDefault =
            get elementId formData
                |> Maybe.withDefault "Non précisé"
                |> (\s ->
                        if String.isEmpty <| String.trim s then
                            "Non précisé"

                        else
                            s
                   )

        defaultView label v =
            div [] [ viewInfo elementId label v ]
    in
    case element of
        BreakToplevel ->
            div [ class "w-full" ] []

        Break ->
            div [ class "w-full" ] []

        Checkbox label ->
            viewCheckbox elementId label dataOrDefault
                |> Checkbox.singleWithDisabled True
                |> Checkbox.viewSingle

        CheckboxWithAriaLabel _ label ->
            viewCheckbox elementId label dataOrDefault
                |> Checkbox.singleWithDisabled True
                |> Checkbox.viewSingle

        CheckboxList title choices ->
            let
                tags =
                    choices
                        |> List.filter (\( choiceId, _ ) -> get choiceId formData /= Nothing)
                        |> List.map
                            (\( _, choice ) ->
                                p
                                    [ class "mr-1 mt-2 fr-tag fr-tag--sm" ]
                                    [ text choice ]
                            )

                tagsOrEmpty =
                    if List.isEmpty tags then
                        [ span
                            [ class "italic text-sm text-gray-500" ]
                            [ text "Aucun élément séléctionné" ]
                        ]

                    else
                        tags

                content =
                    if title /= "" then
                        [ h5
                            [ class "text-base font-normal" ]
                            [ text title ]
                        ]
                            ++ tagsOrEmpty

                    else
                        tagsOrEmpty
            in
            View.Form.column27percent
                [ class "max-h-[220px]"
                , class "overflow-auto mb-5 lg:mb-3"
                ]
                content

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

        FileRequired _ _ ->
            text ""

        Files _ _ ->
            text ""

        Title1 title ->
            h2
                [ class "w-full border-t pt-6"
                , class "text-xl"
                ]
                [ text title ]

        Title2 title ->
            legend [] [ viewTitle2 title ]

        Title3 title ->
            viewTitle3 title

        TitleInlined title ->
            View.Form.column27percent
                []
                [ h4
                    [ class "ml-2"
                    , class "text-base font-normal"
                    ]
                    [ text title ]
                ]

        Info label value ->
            defaultView label value

        Input label ->
            defaultView label dataOrDefault

        InputRequired label ->
            defaultView label dataOrDefault

        EmailRequired label ->
            defaultView label dataOrDefault

        Number label ->
            defaultView label dataOrDefault

        Price label ->
            defaultView label dataOrDefault

        HourCount label ->
            defaultView label dataOrDefault

        Textarea label _ _ ->
            div
                [ class "w-full mb-6" ]
                [ if String.isEmpty label then
                    text ""

                  else
                    viewLabel elementId [ text label ]
                , div
                    [ class "text-sm text-gray-600", id elementId ]
                    [ text dataOrDefault ]
                ]

        ReadOnlyElement readOnlyElement ->
            viewReadOnlyElement formData ( elementId, readOnlyElement )

        ReadOnlyElements readOnlyElements ->
            div [] <|
                List.map
                    (\e -> viewReadOnlyElement formData e)
                    readOnlyElements

        Requirements _ _ ->
            text ""

        Select label choices ->
            List.filter (\( choiceId, _ ) -> choiceId == dataOrDefault) choices
                |> List.head
                |> Maybe.map (\( _, choice ) -> viewInfo elementId label choice)
                |> Maybe.withDefault
                    (div
                        [ class "mb-6" ]
                        [ viewLabel "" [ text label ]
                        , text "Non précisé"
                        ]
                    )

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
            Html.map never content


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
        , label = span [ class "uppercase text-xs font-semibold mb-2" ] [ Accessibility.text label ]
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


viewInputFiles : Bool -> String -> String -> String -> Bool -> Html (Msg referential)
viewInputFiles acceptMultipleFiles elementId title hint isRequired =
    let
        filesDecoder : Json.Decode.Decoder (List File)
        filesDecoder =
            Json.Decode.at [ "target", "files" ] (Json.Decode.list File.decoder)
    in
    div
        [ class "fr-upload-group mb-4 max-w-lg" ]
        [ label
            [ for elementId
            , class "-mt-1 mb-5 block leading-tight"
            , class "text-sm text-gray-800"
            ]
            [ text title
            , span
                [ class "text-xs mt-2 fr-hint-text" ]
                [ text hint ]
            ]
        , input
            [ class "-mb-1 fr-upload w-full lg:w-[520px]"
            , type_ "file"
            , multiple acceptMultipleFiles
            , id elementId
            , name elementId
            , on "change" (Json.Decode.map (UserSelectFiles elementId) filesDecoder)
            , required isRequired
            ]
            []
        ]


viewInfo : String -> String -> String -> Html msg
viewInfo elementId s d =
    viewFieldsetElement
        [ if s /= "" then
            viewLabel elementId [ text s ]

          else
            text ""
        , div [ id elementId ] [ text d ]
        ]


viewTitle2 : String -> Html msg
viewTitle2 title =
    h3
        [ class "text-base font-medium"
        , class "-mt-14 -ml-5"
        ]
        [ text title ]


viewTitle3 : String -> Html msg
viewTitle3 title =
    h4
        [ class "text-base font-normal"
        , class "mb-2"
        , class "w-full md:w-[500px] xl:w-[680px]"
        ]
        [ text title ]



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
viewFieldsets :
    (FormData -> ( String, Element ) -> Html (Msg referential))
    -> FormData
    -> List ( String, Element )
    -> List (Html (Msg referential))
viewFieldsets viewElement formData elements =
    let
        wrapWithBorderedElement : List (Html msg) -> List (Html msg)
        wrapWithBorderedElement l =
            List.map
                (\e ->
                    div
                        [ class "w-full px-6 lg:pl-6 lg:pr-0 pt-5 my-8"
                        , class "border rounded-xl"
                        ]
                        [ e ]
                )
                l

        wrapWithHorizontalLineElement : List (Html msg) -> List (Html msg)
        wrapWithHorizontalLineElement l =
            List.map
                (\e ->
                    div
                        [ class "relative w-full pb-8 last:pb-0 [&:last-child_hr]:hidden" ]
                        [ e
                        , -- We use an absolute hr instead of a border-b to escape the parent padding
                          hr [ class "absolute bottom-0 left-0 lg:left-[-24px] right-0" ] []
                        ]
                )
                l

        viewFieldset : Int -> List (Html msg) -> Html msg
        viewFieldset level content =
            fieldset
                [ class "mb-2"
                , class "flex flex-wrap items-start gap-x-4"
                ]
                content

        groupHelper :
            ( String, Element )
            ->
                { l2 : List (Html (Msg referential))
                , l3 : List (Html (Msg referential))
                , l4 : List (Html (Msg referential))
                , elements : List (Html (Msg referential))
                }
            ->
                { l2 : List (Html (Msg referential))
                , l3 : List (Html (Msg referential))
                , l4 : List (Html (Msg referential))
                , elements : List (Html (Msg referential))
                }
        groupHelper element acc =
            let
                htmlElement =
                    viewElement formData element
            in
            case isNewGroup element of
                Just 2 ->
                    { acc
                        | l2 =
                            viewFieldset 2
                                (htmlElement
                                    :: acc.elements
                                    ++ acc.l4
                                    ++ wrapWithBorderedElement acc.l3
                                )
                                :: acc.l2
                        , l3 = []
                        , l4 = []
                        , elements = []
                    }

                Just 3 ->
                    { acc
                        | l3 =
                            viewFieldset 3
                                (htmlElement
                                    :: acc.elements
                                    ++ wrapWithHorizontalLineElement acc.l4
                                )
                                :: acc.l3
                        , l4 = []
                        , elements = []
                    }

                Just 4 ->
                    { acc
                        | l4 =
                            viewFieldset 4
                                (htmlElement
                                    :: acc.elements
                                )
                                :: acc.l4
                        , elements = []
                    }

                Just _ ->
                    acc

                Nothing ->
                    { acc | elements = htmlElement :: acc.elements }

        isNewGroup : ( String, Element ) -> Maybe Int
        isNewGroup ( _, element ) =
            case element of
                Title1 _ ->
                    Just 2

                Title2 _ ->
                    Just 3

                Title3 _ ->
                    Just 4

                TitleInlined _ ->
                    Just 4

                BreakToplevel ->
                    Just 2

                Break ->
                    Just 4

                _ ->
                    Nothing

        groupedElements =
            List.foldr groupHelper { l2 = [], l3 = [], l4 = [], elements = [] } elements
    in
    groupedElements.elements
        ++ wrapWithBorderedElement groupedElements.l3
        ++ groupedElements.l2


{-| Wrap a complex element that already have internal margins, like radio or checkbox list
-}
viewFieldsetComplexElement : String -> List (Html msg) -> Html msg
viewFieldsetComplexElement extraClass =
    div [ class "mt-2 mr-4", class extraClass ]


{-| Wrap a simple element like input or textarea
-}
viewFieldsetElement : List (Html msg) -> Html msg
viewFieldsetElement =
    View.Form.column33percent [ class "mb-6" ]



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
            , model.onRedirect
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
