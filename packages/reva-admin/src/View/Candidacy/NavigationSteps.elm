module View.Candidacy.NavigationSteps exposing (view)

import Admin.Enum.CandidacyMenuEntryStatus as CandidacyMenuEntryStatus
import BetaGouv.DSFR.Button as Button
import Data.Candidacy exposing (Candidacy, CandidacyMenuEntry)
import Html exposing (Html, div, h2, span, text)
import Html.Attributes exposing (attribute, class)
import RemoteData exposing (RemoteData(..))
import View.Steps


view : RemoteData (List String) Candidacy -> List (Html msg)
view remoteCandidacy =
    case remoteCandidacy of
        Success candidacy ->
            let
                menuHeaderEntries =
                    List.map candidacyMenuEntryView candidacy.candidacyMenu.menuHeader

                mainMenuEntries =
                    List.map candidacyMenuEntryView candidacy.candidacyMenu.mainMenu

                menuFooterEntries =
                    List.map candidacyMenuEntryView candidacy.candidacyMenu.menuFooter
            in
            [ candidateView candidacy
            , View.Steps.view (title "") 0 menuHeaderEntries
            , View.Steps.view (title "Toutes les étapes") 0 mainMenuEntries
            ]
                ++ (if not (List.isEmpty menuFooterEntries) then
                        [ div [ class "border-t-[1px] mr-4" ] []
                        , View.Steps.view (title "") 0 menuFooterEntries
                        ]

                    else
                        []
                   )

        _ ->
            []


candidateView : Candidacy -> Html msg
candidateView candidacy =
    let
        label =
            case candidacy.candidate of
                Just c ->
                    String.toLower c.firstname ++ " " ++ String.toLower c.lastname

                Nothing ->
                    ""
    in
    div [ class "ml-4" ] [ span [ class "fr-icon--xl fr-icon-user-fill mr-2" ] [], span [ class "capitalize text-xl font-bold" ] [ text label ] ]


candidacyMenuEntryView :
    CandidacyMenuEntry
    ->
        { navigation : Maybe ( Html.Attribute msg, Bool )
        , content : List (Html msg)
        }
candidacyMenuEntryView entry =
    let
        externalUrl =
            String.contains "/admin2/" entry.url

        expandedViewStatus =
            case entry.status of
                CandidacyMenuEntryStatus.ActiveWithEditHint ->
                    WITH_EDIT_BUTTON

                _ ->
                    WITHOUT_BUTTON
    in
    { content =
        expandedView expandedViewStatus entry.label
    , navigation =
        if entry.status /= CandidacyMenuEntryStatus.Inactive then
            Just <|
                ( Html.Attributes.href <|
                    entry.url
                , externalUrl
                )

        else
            Nothing
    }


title : String -> Html msg
title value =
    h2
        [ class "mt-2 mb-4 flex items-end"
        , class "text-xl font-semibold"
        ]
        [ text value ]


type ExpandedViewStatus
    = WITH_EDIT_BUTTON
    | WITH_READ_ONLY_BUTTON
    | WITHOUT_BUTTON


expandedView : ExpandedViewStatus -> String -> List (Html msg)
expandedView status stepTitle =
    if status /= WITHOUT_BUTTON then
        let
            buttonLabel =
                case status of
                    WITH_EDIT_BUTTON ->
                        "Compléter"

                    WITH_READ_ONLY_BUTTON ->
                        "Consulter"

                    _ ->
                        ""
        in
        [ span [ class "font-semibold text-dsfrBlue-500" ] [ View.Steps.link stepTitle ]
        , div
            []
            [ Button.new { onClick = Nothing, label = buttonLabel }
                |> Button.withAttrs
                    [ attribute "aria-label" (buttonLabel ++ stepTitle)
                    , class "mb-3"
                    ]
                |> Button.view
            ]
        ]

    else
        [ View.Steps.link stepTitle ]
