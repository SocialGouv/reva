module Actions exposing (Action(..))

import Data.Candidate exposing (Candidate)


type Action
    = UpdateCandidate Candidate
