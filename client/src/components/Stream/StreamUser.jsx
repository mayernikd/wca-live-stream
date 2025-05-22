import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import StreamIcon from '@mui/icons-material/Stream';
import { average, formatAttemptResult } from '../../lib/attempt-result';
import { getEventName } from '../../lib/event-utils';

async function init(type, eventId, person) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");


    const val = await fetch(`https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api/persons/${person.wcaId}.json`);
    const json = JSON.parse(await val.text());

    //let selection = json.rank.averages.map((d)=> {return {id: formatAttemptResult(d.best, d.eventId), title: `${getEventName(d.eventId)} (AVG)`}})
    //selection = selection.concat(json.rank.singles.map((d)=> {return {id: formatAttemptResult(d.best, d.eventId), title: `${getEventName(d.eventId)} (SINGLE)`}}))
    const singleObj = json.rank.singles.find((s) => s.eventId === eventId);
    let single = "First Time Solver"
    if (singleObj !== undefined) {
        single = `${getEventName(eventId)} PR Single: ${formatAttemptResult(singleObj.best, eventId)}`
    }

    const avgObj = json.rank.averages.find((s) => s.eventId === eventId);
    let average = "First Time Solver"
    if (avgObj !== undefined) {
        average = `${getEventName(eventId)} PR Average: ${formatAttemptResult(avgObj.best, eventId)}`
    }

    const data = {
        "model": {
            "fields": [
                {
                    "defaultValue": "Player Name",
                    "id": "name",
                    "title": "Player Name",
                    "type": "text"
                },
                { 
                    "defaultValue": "",
                     "id": `countryFlag`, 
                     "title": `Country Flag`, 
                     "type": "image" 
                },
                {
                    "defaultValue": "333",
                    "id": "eventId",
                    "title": "Event Id",
                    "type": "text"
                },
                {
                    "defaultValue": "0",
                    "id": "single",
                    "title": "Player Best Single",
                    "type": "text"
                },
                {
                    "defaultValue": "0",
                    "id": "average",
                    "title": "Player Best Average",
                    "type": "text"
                }
            ]
        },
        "payload": {
            "name": (json.name + ""),
            "single": type === "single" ? single : average,
            "eventId": eventId,
            "countryFlag": `https://raw.githubusercontent.com/lipis/flag-icons/b919a036693ee1ee0434ef5ae05f93543fc4f437/flags/4x3/${person.country.iso2.toLowerCase()}.svg`

        }
    }

    //console.log(json)


    var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: JSON.stringify(data),
        redirect: 'follow'
    };

    fetch("https://app.singular.live/apiv1/datanodes/0NdPtR2WpFYZtDZ6qflFxT/data", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => {
            console.log('error', error)
        });
}



function StreamUser({ type, eventId, wcaId }) {

    // Render the layout even if the competition is not loaded.
    // This improves UX and also starts loading data for the actual page (like CompetitionHome).
    //const competition = data ? data.competition : null;

    return (
        <Tooltip title="Update Stream">
            <IconButton
                color="inherit"
                onClick={() => {
                    init(type, eventId, wcaId)
                }}
                size="small"
            >
                <StreamIcon />
            </IconButton>
        </Tooltip>
    );
}

export default StreamUser;
