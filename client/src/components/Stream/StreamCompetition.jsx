import { IconButton, Tooltip } from '@mui/material';
import StreamIcon from '@mui/icons-material/Stream';
import { parseActivityCode } from "../../lib/activity-code";
import { eventRoundForActivityCode } from "../../lib/competition";

function getActivityTitle(activityCode, competitionEvents) {
    const { attemptNumber, type } = parseActivityCode(activityCode);

    if(type === "other") return "";

    const { event, round } = eventRoundForActivityCode(competitionEvents, activityCode);

    return attemptNumber
        ? `${event.name} - ${round.name} (Attempt ${attemptNumber})`
        : `${event.name} - ${round.name}`;
}

function getTickerMessageStrings(venues, nowIsoString, competitionEvents) {
    const now = new Date(nowIsoString);

    const nowEvents = [];
    const nextEvents = [];

    venues.forEach(venue => {
        venue.rooms.forEach(room => {
            const activities = room.activities.map(a => ({
                name: a.name,
                startTime: new Date(a.startTime),
                endTime: new Date(a.endTime),
                activityCode: a.activityCode,
            }));

            const ongoing = activities.filter(a => now >= a.startTime && now < a.endTime);
            const upcoming = activities
                .filter(a => a.startTime > now)
                .sort((a, b) => a.startTime - b.startTime)[0];

            ongoing.forEach(activity => {
                if (!activity.activityCode.startsWith("other-")) {
                    const title = getActivityTitle(activity.activityCode, competitionEvents);
                    nowEvents.push(`${title}, ${room.name}`);
                } else {
                    nowEvents.push(`${activity.name}, ${room.name}`);
                }
            });

            if (upcoming) {
                if (!upcoming.activityCode.startsWith("other-")) {
                    const title = getActivityTitle(upcoming.activityCode, competitionEvents);
                    nextEvents.push(`${title}, ${room.name}`);
                } else {
                    nowEvents.push(`${upcoming.name}, ${room.name}`);
                }
            }
        });
    });

    return {
        "Now": "HAPPENING NOW:     " + nowEvents.join("\n") + "\n\n\n\n COMING UP NEXT:     " + nextEvents.join("\n")+ "\n\n\n\n",
        //"Now": "HAPPENING NOW: Xuanyi Geng (耿暄一) vs. Yiheng Wang (王艺衡) \n\n\n\n COMING UP NEXT: Awards\n\n\n\n",
        "UpNext": []
    };
}


async function init(competition, venues) {
    const now = new Date().toISOString();
    const ticker = getTickerMessageStrings(venues, now, competition.competitionEvents);

    const data = JSON.stringify({
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
                    "defaultValue": "",
                    "id": "nowMessage",
                    "title": "Now Message",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "upNextMessage",
                    "title": "Up Next Message",
                    "type": "text"
                }
            ]
        },
        "payload": {
            "competitionId": competition.id,
            "competitionName": competition.shortName,
            "eventName": competition.competitionEvents[0].event.name,
            "eventId": competition.competitionEvents[0].event.id,
            "nowMessage": ticker.Now,
            "upNextMessage": ticker.UpNext,

        }
    }
    );
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: data,
        redirect: 'follow'
    };

    fetch("https://app.singular.live/apiv1/datanodes/4cSqanK8SzwQRPWoN2BGgg/data", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}


function StreamCompetition({ competition, venues }) {

    // Render the layout even if the competition is not loaded.
    // This improves UX and also starts loading data for the actual page (like CompetitionHome).
    //const competition = data ? data.competition : null;

    return (
        <Tooltip title="Update Stream">
            <IconButton
                color="inherit"
                onClick={() => {
                    init(competition, venues)
                    //console.log(competition)
                }}
                size="large"
            >
                <StreamIcon />
            </IconButton>
        </Tooltip>
    );
}

export default StreamCompetition;
