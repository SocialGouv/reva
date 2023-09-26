module View.Candidacy.NavigationSteps exposing (archiveView, dropOutView, reorientationView, view)

import Admin.Enum.CandidacyStatusStep exposing (CandidacyStatusStep(..))
import Admin.Enum.FinanceModule exposing (FinanceModule(..))
import Admin.Enum.OrganismTypology exposing (OrganismTypology(..))
import BetaGouv.DSFR.Button as Button
import Data.Candidacy as Candidacy exposing (Candidacy)
import Html exposing (Html, div, h2, h3, span, text)
import Html.Attributes exposing (attribute, class)
import Route
import Time
import View.Candidacy.Tab
import View.Date
import View.Steps


type ButtonState
    = Enabled
    | Disabled


view : Bool -> String -> Candidacy -> Html msg
view feasibilityFeatureEnabled baseUrl candidacy =
    let
        tab =
            View.Candidacy.Tab.Tab candidacy.id

        appointmentLink =
            Just <| Route.href baseUrl <| Route.Candidacy (tab View.Candidacy.Tab.Meetings)

        trainingLink =
            Just <| Route.href baseUrl <| Route.Candidacy (tab View.Candidacy.Tab.Training)

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
                [ { content = expandedView Enabled "Gestion de la recevabilité" [ ParcoursConfirme ] candidacy
                  , navigation = admissibilityLink
                  }
                ]

            else
                []

        showFeasibilityMenuEntry =
            case candidacy.organism of
                Just organism ->
                    organism.typology /= Experimentation && feasibilityFeatureEnabled

                Nothing ->
                    False

        feasibilityMenuEntryStatus =
            case candidacy.feasibility of
                Just _ ->
                    Disabled

                Nothing ->
                    Enabled

        feasibilityMenuEntry =
            if showFeasibilityMenuEntry then
                [ { content = expandedView feasibilityMenuEntryStatus "Dossier de faisabilité" [ ParcoursConfirme, DossierFaisabiliteIncomplet ] candidacy
                  , navigation = feasibilityLink
                  }
                ]

            else
                []
    in
    View.Steps.view (title "Toutes les étapes")
        (Candidacy.statusToProgressPosition (candidacyStatus candidacy))
        (List.concat
            [ [ { content = expandedView Enabled "Rendez-vous pédagogique" [ PriseEnCharge ] candidacy
                , navigation = appointmentLink
                }
              , { content = expandedView Enabled "Définition du parcours" [ PriseEnCharge ] candidacy
                , navigation = trainingLink
                }
              , { content = [ View.Steps.info "Validation du parcours" ]
                , navigation = Nothing
                }
              ]
            , admissibilityMenuEntry
            , feasibilityMenuEntry
            , [ { content = expandedView Enabled "Jury" [ ParcoursConfirme, DossierFaisabiliteIncomplet ] candidacy
                , navigation = examInfoLink
                }
              , { content = expandedView Enabled "Demande de prise en charge" [ DossierFaisabiliteRecevable, DossierFaisabiliteNonRecevable ] candidacy
                , navigation = fundingRequestLink baseUrl candidacy
                }
              , { content = expandedView Enabled "Demande de paiement" [ DemandeFinancementEnvoye ] candidacy
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
        , { content = expandedView Enabled "Demande de prise en charge" [ DossierFaisabiliteRecevable, DossierFaisabiliteNonRecevable ] candidacy
          , navigation = fundingRequestLink baseUrl candidacy
          }
        , { content = expandedView Enabled "Demande de paiement" [ DemandeFinancementEnvoye ] candidacy
          , navigation = paymentRequestLink baseUrl candidacy
          }
        ]


archiveView : String -> Candidacy -> Html msg
archiveView baseUrl candidacy =
    let
        archiveDate =
            Candidacy.lastStatus candidacy.statuses |> .createdAt

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
            Candidacy.lastStatus candidacy.statuses |> .createdAt

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


expandedView : ButtonState -> String -> List Candidacy.Step -> Candidacy -> List (Html msg)
expandedView buttonState stepTitle showButtonForGivenStatusList candidacy =
    let
        buttonLabel =
            if buttonState == Enabled then
                "Compléter"

            else
                "Consulter"
    in
    if List.member (candidacyStatus candidacy) showButtonForGivenStatusList then
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
    (Candidacy.lastStatus >> .status) candidacy.statuses
