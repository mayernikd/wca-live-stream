import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import StreamIcon from '@mui/icons-material/Stream';
import { formatAttemptResult } from '../../lib/attempt-result';

async function init(round, result, index) {
    const data = {
          "model": {
            "fields": [
                {
                    "defaultValue": "Comp Name",
                    "id": "competitionName",
                    "title": "Competition Name",
                    "type": "text"
                },
                {
                    "defaultValue": "841",
                    "id": "competitionId",
                    "title": "Competition Id",
                    "type": "text"
                },
                {
                    "defaultValue": "333",
                    "id": "eventId",
                    "title": "Event Id",
                    "type": "text"
                },
                {
                    "defaultValue": "3x3x3 Cube",
                    "id": "eventName",
                    "title": "Event Name",
                    "type": "text"
                },
                {
                    "defaultValue": "1",
                    "id": "roundId",
                    "title": "Round Id",
                    "type": "text"
                },
                {
                    "defaultValue": "Round 1",
                    "id": "roundName",
                    "title": "Round Name",
                    "type": "text"
                }
            ]
        },
        "payload": {
          "competitionName": round.competitionEvent.competition.name,
          "competitionId": round.competitionEvent.competition.id,
          "eventName": round.competitionEvent.event.name,
          "eventId": round.competitionEvent.event.id,
          "roundName": round.name,
          "roundId": round.id
        }
    }

    let eventId = round.competitionEvent.event.id;

    index = 0;
    console.log(result)
    //model
    data.model.fields.push({"defaultValue": "", "id": `player${index}name`, "title": `Player ${index} Name`, "type": "text"});
    data.model.fields.push({"defaultValue": "", "id": `player${index}country`, "title": `Player ${index} Country`, "type": "text"});
    data.model.fields.push({"defaultValue": "", "id": `player${index}solveAverage`, "title": `Player ${index} Average`, "type": "text"});
    data.model.fields.push({"defaultValue": "", "id": `player${index}solveBest`, "title": `Player ${index} Best`, "type": "text"});
    data.model.fields.push({"defaultValue": "", "id": `player${index}solveAdvancing`, "title": `Player ${index} Advancing`, "type": "text"});

    //payload
    data.payload[`player${index}name`] = result.person.name;
    data.payload[`player${index}country`] = result.person.country.iso2;
    data.payload[`player${index}solveAverage`] = formatAttemptResult(result.average, eventId);
    data.payload[`player${index}solveBest`] = formatAttemptResult(result.best, eventId);
    data.payload[`player${index}solveRank`] = result.ranking;
    data.payload[`player${index}solveAdvancing`] = result.advancing;
    result.attempts.map((attempt, i)=>{
      data.model.fields.push({"defaultValue": "", "id": `player${index}solve${i}`, "title": `Player ${index} Solve ${i}`, "type": "text"});
      data.payload[`player${index}solve${i}`] = formatAttemptResult(attempt.result, eventId);
    })

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: JSON.stringify(data),
        redirect: 'follow'
      };
      
      fetch("https://app.singular.live/apiv1/datanodes/3oJaI4WmaA1nqVuVuMGwaU/data", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}



function StreamCompetitor({round, id}) {

  // Render the layout even if the competition is not loaded.
  // This improves UX and also starts loading data for the actual page (like CompetitionHome).
  //const competition = data ? data.competition : null;

  return (
    <Tooltip title="Update Stream">
          <IconButton
            color="inherit"
            onClick={()=>{
                init(round)
                console.log(round)
            }}
            size="large"
          >
            <StreamIcon />
          </IconButton>
      </Tooltip>
  );
}

export default StreamCompetitor;
