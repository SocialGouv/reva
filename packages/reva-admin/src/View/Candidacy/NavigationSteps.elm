module View.Candidacy.NavigationSteps exposing (view)

import Admin.Enum.CandidacyMenuEntryStatus as CandidacyMenuEntryStatus
import Admin.Enum.FinanceModule exposing (FinanceModule(..))
import Admin.Enum.OrganismTypology exposing (OrganismTypology(..))
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
                elist =
                    List.map candidacyMenuEntryView candidacy.candidacyMenu.mainMenu
            in
            [ View.Steps.view (title "Toutes les étapes") 0 elist ]

        _ ->
            []


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
