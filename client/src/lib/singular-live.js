import { formatAttemptResult } from './attempt-result';
import { resultsForView } from './result';
import { getEventShortName } from "./event-utils";

function getActivityTitle(eventName, roundName) {
    return `${eventName} ${roundName}`;
}

const ordinal = (n) => {
    const s = ["TH", "ST", "ND", "RD"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export async function UpdateStreamRoundResults(round, rankRange) {

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

    for(var idx=0; idx < 8; idx++){
        data.model.fields.push({ "defaultValue": "", "id": `player${idx}name`, "title": `Player ${idx} Name`, "type": "text" });
        data.model.fields.push({ "defaultValue": "", "id": `player${idx}country`, "title": `Player ${idx} Country`, "type": "text" });
        data.model.fields.push({ "defaultValue": "", "id": `player${idx}countryFlag`, "title": `Player ${idx} Country Flag`, "type": "image" });
        data.model.fields.push({ "defaultValue": "", "id": `player${idx}solveAverage`, "title": `Player ${idx} Average`, "type": "text" });
        data.model.fields.push({ "defaultValue": "", "id": `player${idx}solveBest`, "title": `Player ${idx} Best`, "type": "text" });
        data.model.fields.push({ "defaultValue": "", "id": `player${idx}solveRank`, "title": `Player ${idx} Rank`, "type": "text" });
        data.model.fields.push({ "defaultValue": "", "id": `player${idx}solveAdvancing`, "title": `Player ${idx} Advancing`, "type": "text" });
        data.model.fields.push({ "defaultValue": "", "id": `player${idx}solveHighlightColor`, "title": `Player ${idx} Highlight Color`, "type": "color" });
        data.model.fields.push({ "defaultValue": "", "id": `player${idx}solveCount`, "title": `Player ${idx} Solve Count`, "type": "text" });

        data.payload[`player${idx}name`] = "";
        data.payload[`player${idx}country`] = "";
        data.payload[`player${idx}countryFlag`] = "";
        data.payload[`player${idx}solveAverage`] = "";
        data.payload[`player${idx}solveBest`] = "";
        data.payload[`player${idx}solveRank`] = "";
        data.payload[`player${idx}solveAdvancing`] = "";
        data.payload[`player${idx}solveHighlightColor`] = "#00000000";
        data.payload[`player${idx}solveCount`] = "";
        data.payload[`player${idx}solve0`] = "";
        data.payload[`player${idx}solve1`] = "";
        data.payload[`player${idx}solve2`] = "";
        data.payload[`player${idx}solve3`] = "";
        data.payload[`player${idx}solve4`] = "";
    }

    round.results.forEach((result, index) => {
        const idx = index % 8
        //model
        
        if (result.ranking !== null && result.ranking > rankRange && result.ranking < (rankRange + 9)) {
            //payload
            data.payload[`player${idx}name`] = result.person.name;
            data.payload[`player${idx}country`] = result.person.country.iso2;
            data.payload[`player${idx}countryFlag`] = `https://raw.githubusercontent.com/lipis/flag-icons/b919a036693ee1ee0434ef5ae05f93543fc4f437/flags/4x3/${result.person.country.iso2.toLowerCase()}.svg`;
            data.payload[`player${idx}solveAverage`] = formatAttemptResult(result.average, eventId);
            data.payload[`player${idx}solveBest`] = formatAttemptResult(result.best, eventId);
            data.payload[`player${idx}solveRank`] = result.ranking;
            data.payload[`player${idx}solveAdvancing`] = result.advancing;
            data.payload[`player${idx}solveHighlightColor`] = getHighlightColor(result, round);
            data.payload[`player${idx}solveCount`] = result.attempts.length;
            result.attempts.forEach((attempt, i) => {
                data.model.fields.push({ "defaultValue": "", "id": `player${idx}solve${i}`, "title": `Player ${idx} Solve ${i}`, "type": "text" });
                data.payload[`player${idx}solve${i}`] = formatAttemptResult(attempt.result, eventId);
            })
        }
        
    });

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: JSON.stringify(data),
        redirect: 'follow'
    };

    fetch("https://app.singular.live/apiv1/datanodes/2dVw6vmF70TLbJ0h7xjSWb/data", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

export async function UpdateStreamRoundProjections(round, startNumber, numRecords) {

    const viewResults = resultsForView(round.results,
        round.competitionEvent.event.id,
        round.format,
        true,
        round.advancementCondition,
    )

    console.log(viewResults);
    
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
                },
                {
                    "defaultValue": "Round Format",
                    "id": "roundFormat",
                    "title": "Round Format",
                    "type": "text"
                },
                {
                    "defaultValue": "ADV",
                    "id": "roundAdvance",
                    "title": "Round Advance",
                    "type": "text"
                }
            ]
        },
        "payload": {
            "competitionName": round.competitionEvent.competition.name,
            "competitionId": round.competitionEvent.competition.id,
            "eventName": getActivityTitle(getEventShortName(round.competitionEvent.event.id), round.name),
            "eventId": round.competitionEvent.event.id,
            "roundName": getActivityTitle(round.competitionEvent.event.name, round.name),
            "roundId": round.id,
            "roundFormat": round.format.sortBy == "average" ? "AVERAGE" : "BEST",
            "roundAdvance": (round.advancementCondition === null) ? "FOR 3RD" : "FOR " + ordinal(round.advancementCondition.level) //"ADVANCE"
        }
    }

    let eventId = round.competitionEvent.event.id;
    const playerResults = []
    viewResults.forEach((result) => {
        const playerResult = {}
        const solves = []
        playerResult.rawSolves = []
        playerResult.solves = []
        result.attempts.forEach((attempt) => {
            solves.push(attempt.result)
            playerResult.rawSolves.push(attempt.result)
            playerResult.solves.push(formatAttemptResult(attempt.result, eventId))
        })
        /*
        for(var i=result.attempts.length; i < round.format.numberOfAttempts; i++){
            solves.push(result.best)
        }
        */
        if (result.ranking !== null && result.attempts !== null) {
            playerResults.push({
                ...playerResult,
                name: result.person.name,
                country: result.person.country.iso2,
                average: result.attempts.length == round.format.numberOfAttempts ? formatAttemptResult(result.average, eventId) : formatAttemptResult(result.projectedAverage, eventId),
                best: formatAttemptResult(result.best, eventId),
                ranking: result.ranking,
                advancing: result.advancing,
                advancingColor: getHighlightColor(result, round),
                solveCount: result.attempts.length,
                solveProjection: formatAttemptResult(averageProjection(solves, round.format.sortBy, round.format.numberOfAttempts)),
                BPA: result.bestPossibleAverage,
                WPA: result.worstPossibleAverage,
                forAdvance: result.forAdvance,
                forFirst: result.forFirst
            })
        }
    });

    playerResults.sort((a, b) => {
        switch (round.format.sortBy) {
            case "average":
                const aVal = a.solveCount === round.format.numberOfAttempts ? a.average : a.solveProjection;
                const bVal = b.solveCount === round.format.numberOfAttempts ? b.average : b.solveProjection;

                if (aVal === "DNF") return 1000000;
                if (bVal === "DNF") return aVal;

                return aVal - bVal
            case "best":
                if (a.best === "DNF") return 1000000;
                if (b.best === "DNF") return a.best;

                return a.best - b.best
            default:
                return 0;
        }


    });

    for (var idx = 0; idx < numRecords; idx++) {
        const playerResult =  (idx + startNumber) < playerResults.length  ? playerResults[idx + startNumber] : null

        //model
        data.model.fields.push({ "defaultValue": "", "id": `p${idx}initial`, "title": `Player ${idx} Initial`, "type": "text" });
        data.model.fields.push({ "defaultValue": "", "id": `p${idx}name`, "title": `Player ${idx} Name`, "type": "text" });
        data.model.fields.push({ "defaultValue": "", "id": `p${idx}flag`, "title": `Player ${idx} Country Flag`, "type": "image" });
        data.model.fields.push({ "defaultValue": "", "id": `p${idx}avg`, "title": `Player ${idx} Average`, "type": "text" });
        data.model.fields.push({ "defaultValue": "", "id": `p${idx}proj`, "title": `Player ${idx} Projection`, "type": "text" });
        data.model.fields.push({ "defaultValue": "", "id": `p${idx}best`, "title": `Player ${idx} Best`, "type": "text" });
        data.model.fields.push({ "defaultValue": "", "id": `p${idx}rank`, "title": `Player ${idx} Rank`, "type": "text" });
        data.model.fields.push({ "defaultValue": "", "id": `p${idx}adv`, "title": `Player ${idx} Advancing`, "type": "text" });
        data.model.fields.push({ "defaultValue": "", "id": `p${idx}color`, "title": `Player ${idx} Advancing Highlight Color`, "type": "color" });
        data.model.fields.push({ "defaultValue": "", "id": `p${idx}count`, "title": `Player ${idx} Solve Count`, "type": "text" });
        data.model.fields.push({ "defaultValue": "", "id": `p${idx}countColor`, "title": `Player ${idx} Solve Count Color`, "type": "color" });
        data.model.fields.push({ "defaultValue": "", "id": `p${idx}bpa`, "title": `Player ${idx} BPA`, "type": "text" });
        data.model.fields.push({ "defaultValue": "", "id": `p${idx}wpa`, "title": `Player ${idx} WPA`, "type": "text" });
        data.model.fields.push({ "defaultValue": "", "id": `p${idx}forA`, "title": `Player ${idx} for Advance`, "type": "text" });
        data.model.fields.push({ "defaultValue": "", "id": `p${idx}for1`, "title": `Player ${idx} for First`, "type": "text" });


        data.payload[`p${idx}initial`] = "";
        data.payload[`p${idx}name`] = "";
        data.payload[`p${idx}flag`] = "";
        data.payload[`p${idx}avg`] = "";
        data.payload[`p${idx}best`] = "";
        data.payload[`p${idx}rank`] = "";
        data.payload[`p${idx}adv`] = "";
        data.payload[`p${idx}color`] = "#00000000";
        data.payload[`p${idx}count`] = "";
        data.payload[`p${idx}countColor`] = "#00000000";
        data.payload[`p${idx}proj`] = "";
        data.payload[`p${idx}bpa`] = "";
        data.payload[`p${idx}wpa`] = "";
        data.payload[`p${idx}forA`] = "";
        data.payload[`p${idx}for1`] = "";

        if (playerResult !== null && playerResult !== undefined) {
            const [initial, surname] = formatName(playerResult.name);
            
            data.payload[`p${idx}initial`] = initial;
            data.payload[`p${idx}name`] = surname;
            data.payload[`p${idx}flag`] = `https://raw.githubusercontent.com/lipis/flag-icons/b919a036693ee1ee0434ef5ae05f93543fc4f437/flags/4x3/${playerResult.country.toLowerCase()}.svg`;
            data.payload[`p${idx}avg`] = playerResult.average;
            data.payload[`p${idx}best`] = playerResult.best;
            data.payload[`p${idx}rank`] = idx + 1 + startNumber; //playerResult.ranking;
            data.payload[`p${idx}adv`] = playerResult.advancing;
            data.payload[`p${idx}color`] = playerResult.advancingColor;
            data.payload[`p${idx}count`] = playerResult.solveCount + "/" + round.format.numberOfAttempts;
            data.payload[`p${idx}countColor`] = round.format.numberOfAttempts !== playerResult.solveCount ? "#f3764c" : "#ffffff";
            data.payload[`p${idx}proj`] = round.format.numberOfAttempts !== playerResult.solveCount ? getSolvesRemaining(playerResult.solveCount, round.format.numberOfAttempts) + playerResult.solveProjection : round.format.sortBy === "average" ? playerResult.average : playerResult.solveProjection;
            data.payload[`p${idx}bpa`] = playerResult.bestPossibleAverage === 0 ? "--" : playerResult.bestPossibleAverage;
            data.payload[`p${idx}wpa`] = playerResult.worstPossibleAverage === 0 ? "--" : playerResult.worstPossibleAverage;
            data.payload[`p${idx}forA`] = playerResult.forAdvance === 0 ? "--" : formatAttemptResult(playerResult.forAdvance, eventId);
            data.payload[`p${idx}for1`] = playerResult.forFirst === 0 ? "--" : formatAttemptResult(playerResult.forFirst, eventId);
        }

    }

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: JSON.stringify(data),
        redirect: 'follow'
    };

    fetch("https://app.singular.live/apiv1/datanodes/2qr0ERS5HntVvFVGGEpxEH/data", requestOptions)
        .then(response => response.text())
        .then(result => console.log(JSON.parse(result)))
        .catch(error => console.log('error', error));
}

function getSolvesRemaining(attemptCount, roundCount) {
    if (attemptCount < roundCount) {
        switch (attemptCount) {
            case 1:
                return roundCount === 5 ? "⁴" : "²";
            case 2:
                return roundCount === 5 ? "³" : "¹";
            case 3:
                return "²";
            case 4:
                return "¹";
            default:
                return "";

        }
    }
    return ""
}

function formatName(name) {
    let formattedName = name;
    if (name.includes("(")) {
        formattedName = name.split("(")[0].trim()
    }

    return getInitialAndSurname(formattedName);
}

function getInitialAndSurname(fullName) {
    // Split the full name by spaces
    const nameParts = fullName.trim().split(/\s+/);

    // Ensure there are at least two parts (given name and surname)
    if (nameParts.length < 2) {
        return fullName;
    }

    // Extract the given name and surname
    const givenName = nameParts[0];
    const surname = nameParts[nameParts.length - 1];

    // Get the first letter of the given name
    const initial = givenName.charAt(0) + ".";

    // Combine the initial and surname
    return [initial, surname];
}

export function SendResults(player1, player2) {

    const data = {
        "model": {
            "fields": [
                {
                    "defaultValue": "Player 1 Name",
                    "id": "p1Name",
                    "title": "Player 1 Name",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p1Score1",
                    "title": "Player 1 Score 1",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p1Score2",
                    "title": "Player 1 Score 2",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p1Score3",
                    "title": "Player 1 Score 3",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p1Score4",
                    "title": "Player 1 Score 4",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p1Score5",
                    "title": "Player 1 Score 5",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p1Count",
                    "title": "Player 1 DNF Count",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p1Remaining",
                    "title": "Player 1 Remaining Solves",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p1Mean",
                    "title": "Player 1 Mean",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p1Best",
                    "title": "Player 1 Best",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p1Average",
                    "title": "Player 1 Average",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p1Worst",
                    "title": "Player 1 Worst",
                    "type": "text"
                },
                {
                    "defaultValue": "Player 2 Name",
                    "id": "p2Name",
                    "title": "Player 2 Name",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p2Score1",
                    "title": "Player 2 Score 1",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p2Score2",
                    "title": "Player 2 Score 2",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p2Score3",
                    "title": "Player 2 Score 3",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p2Score4",
                    "title": "Player 2 Score 4",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p2Score5",
                    "title": "Player 2 Score 5",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p2Count",
                    "title": "Player 2 DNF Count",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p2Remaining",
                    "title": "Player 2 Remaining Solves",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p2Mean",
                    "title": "Player 2 Mean",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p2Best",
                    "title": "Player 2 Best",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p2Average",
                    "title": "Player 2 Average",
                    "type": "text"
                },
                {
                    "defaultValue": "",
                    "id": "p2Worst",
                    "title": "Player 2 Worst",
                    "type": "text"
                }
            ]
        },
        "payload": { ...formatResults(player1, 1), ...formatResults(player2, 2) }
    }

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: JSON.stringify(data),
        redirect: 'follow'
    };

    fetch("https://app.singular.live/apiv1/datanodes/4uEqIEL6YSbGZbF4JwL5ac/data", requestOptions)
        .then(response => response.text())
        .then(result => console.log(JSON.parse(result)))
        .catch(error => {
            console.log('error', error)
        });

}

function getResult(result) {
    if (result === undefined || result === null) return "";
    if (result.penalty < 0) return "DNF";
    if (result.result === null) return "";
    return Math.trunc(result.result * 100);
}


export function GetTimeBaseStation(index, callback) {

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch(`https://api.timebase.live/ping/${index}`, requestOptions)
        .then(response => response.text())
        .then(result => callback(result))
        .catch(error => {
            console.log('error', error)
        });
}



function formatResults(player1, index) {
    const item = {}
    item[`p${index}Name`] = ""
    item[`p${index}Score1`] = ""
    item[`p${index}Score2`] = ""
    item[`p${index}Score3`] = ""
    item[`p${index}Score4`] = ""
    item[`p${index}Score5`] = ""
    item[`p${index}Count`] = ""
    item[`p${index}Remaining`] = ""
    item[`p${index}Mean`] = "--"
    item[`p${index}Best`] = "--"
    item[`p${index}Average`] = "--"
    item[`p${index}Worst`] = "--"

    if (player1 === null) return item

    const player1Results = [];
    player1Results.push(getResult(player1.current_results[0]));
    player1Results.push(getResult(player1.current_results[1]));
    player1Results.push(getResult(player1.current_results[2]));
    player1Results.push(getResult(player1.current_results[3]));
    player1Results.push(getResult(player1.current_results[4]));

    const dnCount = player1Results.filter(r => r < 0).length;
    const solvesRemaining = player1Results.filter(r => r === "").length;

    //const eventId = player1.current_results[0] !== null && player1.current_results[0] !== undefined ? player1.current_results[0].event_id : "333";
    let avg = formatSeconds(averageTimeBase(player1Results));
    if (avg < 0 && solvesRemaining === 0) avg = "DNF";
    if (solvesRemaining > 0) avg = "--";

    let best = solvesRemaining === 1 ? formatSeconds(bestAverage(player1Results)) : "--";
    if (best < 0) best = "DNF";

    let worst = solvesRemaining === 1 ? formatSeconds(worstAverage(player1Results)) : "--";
    if (worst < 0) worst = "DNF";

    item[`p${index}Name`] = player1.name
    item[`p${index}Score1`] = player1Results[0] !== "" ? formatSeconds(player1Results[0]) : ""
    item[`p${index}Score2`] = player1Results[1] !== "" ? formatSeconds(player1Results[1]) : ""
    item[`p${index}Score3`] = player1Results[2] !== "" ? formatSeconds(player1Results[2]) : ""
    item[`p${index}Score4`] = player1Results[3] !== "" ? formatSeconds(player1Results[3]) : ""
    item[`p${index}Score5`] = player1Results[4] !== "" ? formatSeconds(player1Results[4]) : ""
    item[`p${index}Count`] = dnCount
    item[`p${index}Remaining`] = solvesRemaining
    item[`p${index}Mean`] = avg
    item[`p${index}Best`] = best
    item[`p${index}Average`] = avg
    item[`p${index}Worst`] = worst

    return item
}

function formatSeconds(time) {
    const seconds = time / 100
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    if (hours > 0) {
        return `${String(hours)}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds.toFixed(2)).padStart(2, '0')}`;
    }
    if (minutes > 0 && remainingSeconds > 9) {
        return `${String(minutes)}:${String(remainingSeconds.toFixed(2)).padStart(2, '0')}`;
    }
    if (minutes > 0 && remainingSeconds < 10) {
        return `${String(minutes)}:0${String(remainingSeconds.toFixed(2))}`;
    }

    return `${String(remainingSeconds.toFixed(2))}`;
}

function averageProjection(results, sortBy, numberOfSolves) {
    if (sortBy === "average") {
        if (numberOfSolves === 5) {
            return averageProjectionAo5(results);
        }
        if (numberOfSolves === 3) {
            return averageProjectionMeanOf3(results);
        }
    }
    if (sortBy === "best") {
        const values = results.filter(r => r > 0)
        switch (values.length) {
            case 0:
                return -1;
            default:
                values.sort((a, b) => a - b);
                return values[0];
        }
    }
}

function averageProjectionMeanOf3(values) {
    if (values.filter(r => r === "").length > 0) return ""
    if (values.filter(r => r <= 0).length > 0) return -1 //DNF toast

    switch (values.length) {
        case 1:
            return values[0];
        case 2:
            return values.reduce((sum, current) => sum + current, 0) / 2;
        case 3:
            return values.reduce((sum, current) => sum + current, 0) / 3;
        default:

    }
    return ""
}

function averageProjectionAo5(results) {
    if (results.filter(r => r === "").length > 0) return ""
    if (results.filter(r => r <= 0).length > 1) return -1

    const values = results.filter(r => r > 0)

    switch (values.length) {
        case 0:
            return "--"
        case 1:
            return values[0];
        case 2:
            if (results.length === values.length) {
                return values.reduce((sum, current) => sum + current, 0) / 2;
            }
            // DNF
            values.sort((a, b) => a - b);
            return values[1];
        case 3:
            if (results.length === values.length) {
                values.sort((a, b) => a - b);
                return values[1];
            }
            // DNF
            values.sort((a, b) => a - b);
            return (values[1] + values[2]) / 2;
        case 4:
            if (results.length === values.length) {
                values.sort((a, b) => a - b);
                return (values[1] + values[2]) / 2;
            }
            // DNF
            values.sort((a, b) => a - b);
            return (values[1] + values[2] + values[3]) / 3;
        case 5:
            values.sort((a, b) => a - b);
            return (values[1] + values[2] + values[3]) / 3;
        default:
            return "--"
    }

}

function averageTimeBase(results) {
    if (results.filter(r => r === "").length > 0) return "--"
    if (results.filter(r => r === "DNF").length > 1) return -1

    const values = results.filter(r => r !== "DNF")
    if (results.length !== values.length) {
        values.sort((a, b) => b - a);
        return (values.slice(0, 3).reduce((sum, current) => sum + current, 0)) / 3;
    } else {
        values.sort((a, b) => a - b);
        return (values.slice(1, 4).reduce((sum, current) => sum + current, 0)) / 3;
    }
}

function bestAverage(results) {
    if (results.filter(r => r !== "").length !== 4) return "--"
    if (results.filter(r => r === "DNF").length > 1) return -1

    const values = results.filter(r => r !== "DNF" && r !== "")
    values.push(0)

    values.sort((a, b) => a - b);
    return (values.slice(1, 4).reduce((sum, current) => sum + current, 0)) / 3;

}


function worstAverage(results) {
    if (results.filter(r => r !== "").length !== 4) return "--"
    if (results.filter(r => r === "DNF").length > 0) return -1

    const values = results.filter(r => r !== "DNF" && r !== "")

    values.sort((a, b) => b - a);
    return (values.slice(0, 3).reduce((sum, current) => sum + current, 0)) / 3;

}

function getHighlightColor(result, round){
    // check if finals -- so advancementCondition === null
    const isFinals = (round.advancementCondition === null);
    const isFinished = round.finished;

    if(result.advancing){
        if(isFinals){
            if(isFinished){
                switch(result.ranking){
                    case 1:
                        return "#d7a800";
                    case 2:
                        return "#aaaaaa";
                    case 3: 
                        return "#bd7700";
                    default:
                        break;
                }
            } else {
                switch(result.ranking){
                    case 1:
                        return "#d7a800";
                    case 2:
                        return "#aaaaaa";
                    case 3: 
                        return "#bd7700";
                    default:
                        if(result.advancingQuestionable) return "#519234CC";
                }
            }
        } else {
            if(isFinished && result.advancing) return "#519234"; 
            if(!isFinished && result.advancingQuestionable) return "#519234CC"; 
        }
    }

    return "#00000000";
}