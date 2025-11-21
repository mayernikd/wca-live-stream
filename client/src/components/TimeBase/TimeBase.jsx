
import { useParams } from "react-router-dom";
import TimeBaseStations from "./TimeBaseStations";


function TimeBase() {
  // Expect a route like "/competition/:competitionId/time-base"
  const { competitionId } = useParams();
  return (
    <TimeBaseStations
      competitionId={competitionId}
    />
  );
}

export default TimeBase;
