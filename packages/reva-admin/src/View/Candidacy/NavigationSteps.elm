module View.Candidacy.NavigationSteps exposing (view)

import Admin.Enum.CandidacyStatusStep as Step exposing (CandidacyStatusStep(..))
import Admin.Enum.FinanceModule exposing (FinanceModule(..))
import Admin.Enum.OrganismTypology exposing (OrganismTypology(..))
import BetaGouv.DSFR.Button as Button
import Data.Candidacy as Candidacy exposing (Candidacy)
import Data.Context exposing (Context)
import Html exposing (Html, div, h2, h3, span, text)
import Html.Attributes exposing (attribute, class)
import RemoteData exposing (RemoteData(..))
import Route
import Time
import View.Candidacy.Tab
import View.Date
import View.Steps


view : Context -> RemoteData (List String) Candidacy -> List (Html msg)
view context remoteCandidacy =
    case remoteCandidacy of
        Success candidacy ->
            [ case candidacy.dropOutDate of
                Just droppedOutDate ->
                    dropOutView context.baseUrl candidacy droppedOutDate

                Nothing ->
                    if Candidacy.lastStatus candidacy.statuses == Step.Archive then
                        if Candidacy.isCandidacyReoriented candidacy then
                            reorientationView context.baseUrl candidacy

                        else
                            archiveView context.baseUrl candidacy

                    else
                        activeView context.baseUrl candidacy
            ]

        _ ->
            []


activeView : String -> Candidacy -> Html msg
activeView baseUrl candidacy =
    let
        tab =
            View.Candidacy.Tab.Tab candidacy.id

        appointmentLink =
            Just <| Route.href baseUrl <| Route.Candidacy (tab View.Candidacy.Tab.Meetings)

        trainingLink =
            if candidacy.conventionCollective /= Nothing then
                Just <| Route.href baseUrl <| Route.Candidacy (tab View.Candidacy.Tab.Training)

            else if candidacy.firstAppointmentOccuredAt /= Nothing then
                Just <| Route.href baseUrl <| Route.Typology candidacy.id (Route.TypologyFilters (String.toInt "1" |> Maybe.withDefault 1))

            else
                Nothing

        admissibilityLink =
            if Candidacy.isStatusEqualOrAbove candidacy ParcoursConfirme then
                Just <| Route.href baseUrl <| Route.Candidacy (tab View.Candidacy.Tab.Admissibility)

            else
                Nothing

        examInfoLink =
            if Candidacy.isStatusEqualOrAbove candidacy ParcoursConfirme then
                Just <| Route.href baseUrl <| Route.Candidacy (tab View.Candidacy.Tab.ExamInfo)

            else
                Nothing

        feasibilityLink =
            if Candidacy.isStatusEqualOrAbove candidacy ParcoursConfirme then
                Just <|
                    Route.href baseUrl <|
                        Route.Candidacy (tab View.Candidacy.Tab.Feasibility)

            else
                Nothing

        showAdmissibilityMenuEntry =
            case candidacy.organism of
                Just organism ->
                    organism.typology == Experimentation

                Nothing ->
                    False

        admissibilityMenuEntry =
            if showAdmissibilityMenuEntry then
                [ { content =
                        expandedView
                            (getDefaultExpandedViewStatusFromCandidacyStatus
                                candidacy
                                [ ParcoursConfirme ]
                            )
                            "Gestion de la recevabilité"
                  , navigation = admissibilityLink
                  }
                ]

            else
                []

        showFeasibilityMenuEntry =
            case candidacy.organism of
                Just organism ->
                    organism.typology /= Experimentation

                Nothing ->
                    False

        feasibilityMenuEntryStatus =
            if List.member (candidacyStatus candidacy) [ ParcoursConfirme, DossierFaisabiliteIncomplet ] then
                case candidacy.feasibility of
                    Just _ ->
                        WITH_READ_ONLY_BUTTON

                    Nothing ->
                        WITH_EDIT_BUTTON

            else
                WITHOUT_BUTTON

        trainingMenuEntryStatus =
            if List.member (candidacyStatus candidacy) [ PriseEnCharge ] && candidacy.firstAppointmentOccuredAt /= Nothing then
                WITH_EDIT_BUTTON

            else
                WITHOUT_BUTTON

        feasibilityMenuEntry =
            if showFeasibilityMenuEntry then
                [ { content = expandedView feasibilityMenuEntryStatus "Dossier de faisabilité"
                  , navigation = feasibilityLink
                  }
                ]

            else
                []
    in
    View.Steps.view (title "Toutes les étapes")
        (Candidacy.statusToProgressPosition (candidacyStatus candidacy))
        (List.concat
            [ [ { content =
                    expandedView
                        (getDefaultExpandedViewStatusFromCandidacyStatus
                            candidacy
                            [ PriseEnCharge ]
                        )
                        "Rendez-vous pédagogique"
                , navigation = appointmentLink
                }
              , { content =
                    expandedView
                        trainingMenuEntryStatus
                        "Définition du parcours"
                , navigation = trainingLink
                }
              , { content = [ View.Steps.info "Validation du parcours" ]
                , navigation = Nothing
                }
              ]
            , admissibilityMenuEntry
            , feasibilityMenuEntry
            , [ { content =
                    expandedView
                        (getDefaultExpandedViewStatusFromCandidacyStatus
                            candidacy
                            [ ParcoursConfirme, DossierFaisabiliteIncomplet ]
                        )
                        "Jury"
                , navigation = examInfoLink
                }
              , { content =
                    expandedView
                        (getDefaultExpandedViewStatusFromCandidacyStatus
                            candidacy
                            [ DossierFaisabiliteRecevable, DossierFaisabiliteNonRecevable ]
                        )
                        "Demande de prise en charge"
                , navigation = fundingRequestLink baseUrl candidacy
                }
              , { content =
                    expandedView
                        (getDefaultExpandedViewStatusFromCandidacyStatus
                            candidacy
                            [ DemandeFinancementEnvoye ]
                        )
                        "Demande de paiement"
                , navigation = paymentRequestLink baseUrl candidacy
                }
              ]
            ]
        )


dropOutView : String -> Candidacy -> Time.Posix -> Html msg
dropOutView baseUrl candidacy dropOutDate =
    let
        tab =
            View.Candidacy.Tab.Tab candidacy.id

        dropOutInfo =
            [ h3 [ class "text-sm mt-1" ] [ text "Abandon du candidat confirmé" ]
            , span [ class "text-sm text-gray-700 mb-2" ] [ text <| View.Date.toFullFormat dropOutDate ]
            ]

        dropOutLink =
            Just <| Route.href baseUrl <| Route.Candidacy (tab View.Candidacy.Tab.DropOut)

        progressPosition =
            if Candidacy.isPaymentRequestSent candidacy then
                4

            else if Candidacy.isFundingRequestSent candidacy then
                3

            else
                2
    in
    View.Steps.view (title "Abandon du candidat")
        progressPosition
        [ { content = dropOutInfo
          , navigation = dropOutLink
          }
        , { content =
                expandedView
                    (getDefaultExpandedViewStatusFromCandidacyStatus
                        candidacy
                        [ DossierFaisabiliteRecevable, DossierFaisabiliteNonRecevable ]
                    )
                    "Demande de prise en charge"
          , navigation = fundingRequestLink baseUrl candidacy
          }
        , { content =
                expandedView
                    (getDefaultExpandedViewStatusFromCandidacyStatus
                        candidacy
                        [ DemandeFinancementEnvoye ]
                    )
                    "Demande de paiement"
          , navigation = paymentRequestLink baseUrl candidacy
          }
        ]


archiveView : String -> Candidacy -> Html msg
archiveView baseUrl candidacy =
    let
        archiveDate =
            Candidacy.lastStatusDate candidacy.statuses

        archiveLink =
            Route.href baseUrl <| Route.Candidacy (View.Candidacy.Tab.Tab candidacy.id View.Candidacy.Tab.Archive)
    in
    View.Steps.view (title "Candidature supprimée")
        2
        [ { content = [ text "Supprimée le ", text archiveDate.fullFormat ]
          , navigation = Just archiveLink
          }
        ]


reorientationView : String -> Candidacy -> Html msg
reorientationView baseUrl candidacy =
    let
        archiveDate =
            Candidacy.lastStatusDate candidacy.statuses

        archiveLink =
            Route.href baseUrl <| Route.Candidacy (View.Candidacy.Tab.Tab candidacy.id View.Candidacy.Tab.Archive)
    in
    View.Steps.view (title "Candidature réorientée")
        2
        [ { content = [ text "Réorientée le ", text archiveDate.fullFormat ]
          , navigation = Just archiveLink
          }
        ]


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


getDefaultExpandedViewStatusFromCandidacyStatus : Candidacy -> List CandidacyStatusStep -> ExpandedViewStatus
getDefaultExpandedViewStatusFromCandidacyStatus candidacy statusToEnableExpandedViewFor =
    if List.member (candidacyStatus candidacy) statusToEnableExpandedViewFor then
        WITH_EDIT_BUTTON

    else
        WITHOUT_BUTTON


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


fundingRequestLink : String -> Candidacy -> Maybe (Html.Attribute msg)
fundingRequestLink baseUrl candidacy =
    let
        canAccessFundingRequest =
            case candidacy.financeModule of
                Unireva ->
                    candidacy.dropOutDate /= Nothing || Candidacy.isStatusEqualOrAbove candidacy ParcoursConfirme

                Unifvae ->
                    Candidacy.isStatusEqualOrAbove candidacy DossierFaisabiliteRecevable
    in
    if canAccessFundingRequest then
        Just <|
            Route.href baseUrl <|
                Route.Candidacy <|
                    View.Candidacy.Tab.Tab candidacy.id View.Candidacy.Tab.FundingRequest

    else
        Nothing


paymentRequestLink : String -> Candidacy -> Maybe (Html.Attribute msg)
paymentRequestLink baseUrl candidacy =
    let
        tab =
            View.Candidacy.Tab.Tab candidacy.id View.Candidacy.Tab.PaymentRequest
    in
    if Candidacy.isStatusEqualOrAbove candidacy DemandeFinancementEnvoye then
        Just <| Route.href baseUrl <| Route.Candidacy tab

    else
        Nothing


candidacyStatus : Candidacy -> Candidacy.Step
candidacyStatus candidacy =
    Candidacy.lastStatus candidacy.statuses
