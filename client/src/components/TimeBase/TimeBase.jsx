import React from "react";
import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";

import Loading from "../Loading/Loading";
import Error from "../Error/Error";
import TimeBaseStations from "./TimeBaseStations";

// GraphQL query to fetch competition details and its competitors
export const COMPETITORS_QUERY = gql/* GraphQL */ `
  query Competition($competitionId: ID!) {
    competition(id: $competitionId) {
      id
      wcaId
      competitors {
        id
        name
        country {
          iso2
        }
      }
    }
  }
`;

function TimeBase() {
  // Expect a route like "/competition/:competitionId/time-base"
  const { competitionId } = useParams();

  const { data, loading, error } = useQuery(COMPETITORS_QUERY, {
    variables: { competitionId },
    fetchPolicy: "cache-first",
  });

  if (loading) return <Loading />;
  if (error) return <Error error={error} />;
  if (!data) return null; // Safeguard against undefined data

  const {
    competition: { competitors, wcaId: competitionWcaId },
  } = data;

  return (
    <TimeBaseStations
      competitors={competitors}
      competitionId={competitionWcaId}
    />
  );
}

export default TimeBase;
