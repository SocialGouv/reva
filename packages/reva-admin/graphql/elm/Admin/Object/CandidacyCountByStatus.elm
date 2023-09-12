-- Do not manually edit this file, it was auto-generated by dillonkearns/elm-graphql
-- https://github.com/dillonkearns/elm-graphql


module Admin.Object.CandidacyCountByStatus exposing (..)

import Admin.InputObject
import Admin.Interface
import Admin.Object
import Admin.Scalar
import Admin.Union
import Data.Scalar
import Graphql.Internal.Builder.Argument as Argument exposing (Argument)
import Graphql.Internal.Builder.Object as Object
import Graphql.Internal.Encode as Encode exposing (Value)
import Graphql.Operation exposing (RootMutation, RootQuery, RootSubscription)
import Graphql.OptionalArgument exposing (OptionalArgument(..))
import Graphql.SelectionSet exposing (SelectionSet)
import Json.Decode as Decode


activeHorsAbandon : SelectionSet Int Admin.Object.CandidacyCountByStatus
activeHorsAbandon =
    Object.selectionForField "Int" "ACTIVE_HORS_ABANDON" [] Decode.int


abandon : SelectionSet Int Admin.Object.CandidacyCountByStatus
abandon =
    Object.selectionForField "Int" "ABANDON" [] Decode.int


reorientee : SelectionSet Int Admin.Object.CandidacyCountByStatus
reorientee =
    Object.selectionForField "Int" "REORIENTEE" [] Decode.int


archiveHorsAbandonHorsReorientation : SelectionSet Int Admin.Object.CandidacyCountByStatus
archiveHorsAbandonHorsReorientation =
    Object.selectionForField "Int" "ARCHIVE_HORS_ABANDON_HORS_REORIENTATION" [] Decode.int


parcoursConfirmeHorsAbandon : SelectionSet Int Admin.Object.CandidacyCountByStatus
parcoursConfirmeHorsAbandon =
    Object.selectionForField "Int" "PARCOURS_CONFIRME_HORS_ABANDON" [] Decode.int


priseEnChargeHorsAbandon : SelectionSet Int Admin.Object.CandidacyCountByStatus
priseEnChargeHorsAbandon =
    Object.selectionForField "Int" "PRISE_EN_CHARGE_HORS_ABANDON" [] Decode.int


parcoursEnvoyeHorsAbandon : SelectionSet Int Admin.Object.CandidacyCountByStatus
parcoursEnvoyeHorsAbandon =
    Object.selectionForField "Int" "PARCOURS_ENVOYE_HORS_ABANDON" [] Decode.int


dossierFaisabiliteEnvoyeHorsAbandon : SelectionSet Int Admin.Object.CandidacyCountByStatus
dossierFaisabiliteEnvoyeHorsAbandon =
    Object.selectionForField "Int" "DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON" [] Decode.int


demandeFinancementEnvoyeHorsAbandon : SelectionSet Int Admin.Object.CandidacyCountByStatus
demandeFinancementEnvoyeHorsAbandon =
    Object.selectionForField "Int" "DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON" [] Decode.int


demandePaiementEnvoyeeHorsAbandon : SelectionSet Int Admin.Object.CandidacyCountByStatus
demandePaiementEnvoyeeHorsAbandon =
    Object.selectionForField "Int" "DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON" [] Decode.int


validationHorsAbandon : SelectionSet Int Admin.Object.CandidacyCountByStatus
validationHorsAbandon =
    Object.selectionForField "Int" "VALIDATION_HORS_ABANDON" [] Decode.int


projetHorsAbandon : SelectionSet Int Admin.Object.CandidacyCountByStatus
projetHorsAbandon =
    Object.selectionForField "Int" "PROJET_HORS_ABANDON" [] Decode.int


dossierFaisabiliteRecevableHorsAbandon : SelectionSet Int Admin.Object.CandidacyCountByStatus
dossierFaisabiliteRecevableHorsAbandon =
    Object.selectionForField "Int" "DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON" [] Decode.int


dossierFaisabiliteNonRecevableHorsAbandon : SelectionSet Int Admin.Object.CandidacyCountByStatus
dossierFaisabiliteNonRecevableHorsAbandon =
    Object.selectionForField "Int" "DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON" [] Decode.int
