import { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";

const ROUND_RESULT_FRAGMENT = gql`
  fragment roundResult on Result {
    ranking
    advancing
    advancingQuestionable
    attempts {
      result
    }
    best
    average
    person {
      wcaId
      id
      name
      country {
        iso2
        name
      }
    }
    singleRecordTag
    averageRecordTag
  }
`;

const ROUND_QUERY = gql`
  query Round($id: ID!) {
    round(id: $id) {
      id
      name
      finished
      active
      competitionEvent {
        id
        competition {
          id
          name
        }
        event {
          id
          name
        }
      }
      format {
        id
        numberOfAttempts
        sortBy
      }
      advancementCondition {
        level
        type
      }
      results {
        id
        ...roundResult
      }
    }
  }
  ${ROUND_RESULT_FRAGMENT}
`;

const ROUND_UPDATED_SUBSCRIPTION = gql`
  subscription RoundUpdated($id: ID!) {
    roundUpdated(id: $id) {
      id
      results {
        id
        ...roundResult
      }
    }
  }
  ${ROUND_RESULT_FRAGMENT}
`;

export function useRound(roundId) {
    const {
        data: newData,
        loading,
        error,
        refetch,
        subscribeToMore,
    } = useQuery(ROUND_QUERY, {
        variables: { id: roundId },
    });

    const [previousData, setPreviousData] = useState(null);
    const [forecastView, setForecastView] = useState(false);

    useEffect(() => {
        if (newData) setPreviousData(newData);
    }, [newData]);

    useEffect(() => {
        setForecastView(false);
    }, [roundId]);

    const data = newData || previousData;

    const shouldSubscribe =
        data && data.round && (!data.round.finished || data.round.active);

    useEffect(() => {
        if (shouldSubscribe) {
            const unsubscribe = subscribeToMore({
                document: ROUND_UPDATED_SUBSCRIPTION,
                variables: { id: roundId },
            });
            return () => unsubscribe();
        }
    }, [subscribeToMore, roundId, shouldSubscribe]);

    // Manual refresh
    const refresh = async () => {
        try {
            const result = await refetch();
            if (result?.data) {
                setPreviousData(result.data);
                return result.data.round;
            }
        } catch (err) {
            console.error("Failed to refresh round:", err);
        }
        return null;
    };


    return {
        round: data?.round,
        loading,
        error,
        forecastView,
        setForecastView,
        refresh,
    };
}
