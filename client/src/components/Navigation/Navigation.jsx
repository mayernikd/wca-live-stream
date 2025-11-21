import { Routes, Route } from "react-router-dom";
import AdminCompetitionNavigation from "../admin/AdminCompetitionNavigation/AdminCompetitionNavigation";
import CompetitionNavigation from "../CompetitionNavigation/CompetitionNavigation";
import DefaultNavigation from "../DefaultNavigation/DefaultNavigation";
import TimeBase from "../TimeBase/TimeBase";

function Navigation() {

  return (
    <Routes>
      <Route
        path="/competitions/:competitionId/*"
        element={<CompetitionNavigation />}
      />
      <Route path="/:competitionId/timebase" element={<TimeBase />} />
      <Route
        path="/admin/competitions/:competitionId/*"
        element={<AdminCompetitionNavigation />}
      />
      <Route path="/*" element={<DefaultNavigation />} />
    </Routes>
  );
}

export default Navigation;

