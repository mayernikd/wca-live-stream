import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import StreamIcon from '@mui/icons-material/Stream';
import { average, formatAttemptResult } from '../../lib/attempt-result';
import { getEventName } from '../../lib/event-utils';

function getTopFacts(data, currentEventId) {
    const facts = [];

    const ordinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    const getTopPlacement = (rank) => {
        if (!rank) return null;
        if (rank.world === 1) return { level: "World", rank: rank.world };
        if (rank.continent === 1) return { level: "Continent", rank: rank.continent };
        if (rank.country === 1) return { level: "National", rank: rank.country };
        return null;
    };

    const boostIfCurrent = (eventId, baseScore) =>
        eventId === currentEventId ? baseScore + 1000 : baseScore;

    // 1. Best national rank (singles)
    let bestNat = { rank: Infinity, eventId: '', best: null };
    for (const r of data.rank.singles || []) {
        if (r.rank?.country < bestNat.rank) {
            bestNat = { rank: r.rank.country, eventId: r.eventId, best: r.best };
        }
    }
    if (bestNat.rank < 21) {
        facts.push({
            score: boostIfCurrent(bestNat.eventId, 100 - bestNat.rank),
            text: `Ranked ${ordinal(bestNat.rank)} nationally in ${bestNat.eventId.toUpperCase()} with a best single (${formatSeconds(bestNat.best)})`,
        });
    }

    // 2. Best continental rank (singles)
    let bestCont = { rank: Infinity, eventId: '', best: null };
    for (const r of data.rank.singles || []) {
        if (r.rank?.continent < bestCont.rank) {
            bestCont = { rank: r.rank.continent, eventId: r.eventId, best: r.best };
        }
    }
    if (bestCont.rank < 51) {
        facts.push({
            score: boostIfCurrent(bestCont.eventId, 90 - bestCont.rank),
            text: `Ranked ${ordinal(bestCont.rank)} in their continent for ${bestCont.eventId.toUpperCase()} with a best single (${formatSeconds(bestCont.best)})`,
        });
    }

    // 3. Championship participation
    if (data.numberOfChampionships > 0) {
        facts.push({
            score: 30 + data.numberOfChampionships * 5,
            text: `Participated in ${data.numberOfChampionships} championship events`,
        });
    }

    // 4. Total competition participation
    facts.push({
        score: 20 + data.numberOfCompetitions / 2,
        text: `Has competed in ${data.numberOfCompetitions} official competitions`,
    });

    // 5. Best average rank (national)
    let bestAvgNat = { rank: Infinity, eventId: '', best: null };
    for (const r of data.rank.averages || []) {
        if (r.rank?.country < bestAvgNat.rank) {
            bestAvgNat = { rank: r.rank.country, eventId: r.eventId, best: r.best };
        }
    }
    if (bestAvgNat.rank < 21) {
        facts.push({
            score: boostIfCurrent(bestAvgNat.eventId, 85 - bestAvgNat.rank),
            text: `Ranked ${ordinal(bestAvgNat.rank)} best national average in ${bestAvgNat.eventId.toUpperCase()} (${formatSeconds(bestAvgNat.best)})`,
        });
    }

    // 6. Medals
    const { gold = 0, silver = 0, bronze = 0 } = data.medals || {};
    const total = gold + silver + bronze;
    if (total > 0) {
        const parts = [];
        if (gold) parts.push(`${gold} gold`);
        if (silver) parts.push(`${silver} silver`);
        if (bronze) parts.push(`${bronze} bronze`);
        facts.push({
            score: 40 + gold * 5 + silver * 3 + bronze * 2,
            text: `Won ${total} medals: ${parts.join(', ')}`,
        });
    }

    // 7. Most participated event
    const eventFreq = {};
    for (const comp of Object.values(data.results || {})) {
        for (const eventId of Object.keys(comp)) {
            eventFreq[eventId] = (eventFreq[eventId] || 0) + 1;
        }
    }
    const [mostEvent, mostCount] = Object.entries(eventFreq).sort((a, b) => b[1] - a[1])[0] || [];
    if (mostEvent) {
        facts.push({
            score: boostIfCurrent(mostEvent, 10 + mostCount),
            text: `Most frequently competed event: ${mostEvent.toUpperCase()} (${mostCount} times)`,
        });
    }

    // 8. Global top 1000 rank
    const topGlobal = (data.rank.singles || []).find((e) => e.rank?.world <= 101);
    if (topGlobal) {
        facts.push({
            score: boostIfCurrent(topGlobal.eventId, 100 - topGlobal.rank.world / 10),
            text: `World ranked ${ordinal(topGlobal.rank.world)} in ${topGlobal.eventId.toUpperCase()} with single (${formatSeconds(topGlobal.best)})`,
        });
    }

    // 9. Record (WR, CR, NR) – one per event
    const seenEvents = new Set();
    const records = [];

    for (const r of [...(data.rank.singles || []), ...(data.rank.averages || [])]) {
        const eid = r.eventId;
        if (seenEvents.has(eid)) continue;

        const top = getTopPlacement(r.rank);
        if (top) {
            seenEvents.add(eid);

            records.push({
                score: boostIfCurrent(eid, 200000),
                text: `Holds a ${top.level} Record in ${eid.toUpperCase()} (${formatSeconds(r.best)})`,
            });
        }
    }
    facts.push(...records);
    // Final sort and top 3
    return facts.sort((a, b) => b.score - a.score).slice(0, 3).map(f => f.text);
}




function getBest(arr) {
    if (arr !== undefined && arr !== null && arr.length > 0) {
        return formatSeconds(arr[0].best);
    }
    return "";
}

function getRankText(arr) {
    if (arr !== undefined && arr !== null && arr.length > 0) {
        var world = arr[0].rank.world;
        var continent = arr[0].rank.continent;
        var country = arr[0].rank.country;

        if (world < 6) return "WR: " + world;
        if (continent < 6) return "CR: " + continent;
        if (country < 6) return "NR: " + country;

    }
    return "";
}

function calculateAverageOfAverages(results) {
    let totalAverage = 0;
    let count = 0;

    for (const event in results) {
        if (results.hasOwnProperty(event)) {
            results[event].forEach(detail => {
                if (detail.average) {
                    totalAverage += detail.average;
                    count++;
                }
            });
        }
    }

    return count === 0 ? 0 : totalAverage / count;
}

function calculateOverallAverageForChampionships(championshipIds, results) {
    let totalAverage = 0;
    let count = 0;

    championshipIds.forEach(championship => {
        for (const event in results) {
            if (results.hasOwnProperty(event) && event.includes(championship)) {
                results[event].forEach(detail => {
                    if (detail.average && (detail.position === 1 || detail.position === 2 || detail.position === 3)) {
                        totalAverage += detail.average;
                        count++;
                    }
                });
            }
        }
    });

    return count === 0 ? 0 : totalAverage / count;
}

function getYearlyAverages(data, year, eventId) {

    const results2023 = {};
    for (const event in data.results) {
        if (data.results.hasOwnProperty(event)) {
            if (event.includes(year)) {
                const eventDetails = data.results[event];
                for (const subEvent in eventDetails) {
                    if (eventDetails.hasOwnProperty(subEvent)) {
                        if (subEvent === eventId) {
                            if (!results2023[event]) {
                                results2023[event] = [];
                            }
                            results2023[event] = results2023[event].concat(eventDetails[subEvent]);
                        }
                    }
                }
            }
        }
    }

    const championshipIds2023 = data.championshipIds.filter(id => id.includes(year));

    return {
        year: year,
        average: formatSeconds(calculateAverageOfAverages(results2023)),
        averageChamps: formatSeconds(calculateOverallAverageForChampionships(championshipIds2023, results2023)),
        averageFinals: formatSeconds(calculateOverallAverageForChampionshipFinalRounds(championshipIds2023, results2023))
    }
}

function calculateOverallAverageForChampionshipFinalRounds(championshipIds, results) {
    let totalAverage = 0;
    let count = 0;

    championshipIds.forEach(championship => {
        for (const event in results) {
            if (results.hasOwnProperty(event) && event.includes(championship)) {
                results[event].forEach(detail => {
                    if (detail.average && detail.round === "Final" && (detail.position === 1 || detail.position === 2 || detail.position === 3)) {
                        totalAverage += detail.average;
                        count++;
                    }
                });
            }
        }
    });

    return count === 0 ? 0 : totalAverage / count;
}

function formatSeconds(time) {
    if (isNaN(time)) return time
    if (time == "") return ""

    const seconds = time / 100;
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

async function init(eventId, person) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");


    const playerResp = await fetch(`https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api/persons/${person.wcaId}.json`);
    const playerData = JSON.parse(await playerResp.text());

    //let selection = json.rank.averages.map((d)=> {return {id: formatAttemptResult(d.best, d.eventId), title: `${getEventName(d.eventId)} (AVG)`}})
    //selection = selection.concat(json.rank.singles.map((d)=> {return {id: formatAttemptResult(d.best, d.eventId), title: `${getEventName(d.eventId)} (SINGLE)`}}))
    const singleObj = playerData.rank.singles.find((s) => s.eventId === eventId);
    let single = "First Time Solver"
    if (singleObj !== undefined) {
        single = `${getEventName(eventId)} PR Single: ${formatAttemptResult(singleObj.best, eventId)}`
    }

    const avgObj = playerData.rank.averages.find((s) => s.eventId === eventId);
    let average = "First Time Solver"
    if (avgObj !== undefined) {
        average = `${getEventName(eventId)} PR Average: ${formatAttemptResult(avgObj.best, eventId)}`
    }

    const facts = getTopFacts(playerData, eventId);


    const playerStats = {
        name: playerData.name,
        wcaId: playerData.id,
        country: playerData.country,
        image: "",
        numberOfCompetitions: playerData.numberOfCompetitions,
        bestAverage: getBest(playerData.rank.averages.filter(r => r.eventId === eventId)),
        bestSingle: getBest(playerData.rank.singles.filter(r => r.eventId === eventId)),
        rankAverage: getRankText(playerData.rank.averages.filter(r => r.eventId === eventId)),
        rankSingle: getRankText(playerData.rank.singles.filter(r => r.eventId === eventId)),
        eventId: eventId,
        fact1: facts[0],
        fact2: facts[1],
        fact3: facts[2],
        years: [
            getYearlyAverages(playerData, "2025", eventId),
            getYearlyAverages(playerData, "2024", eventId),
            getYearlyAverages(playerData, "2023", eventId)
        ]
    }


    const data = {
        "model": {
            "fields": [
                {
                    "defaultValue": "Player Name",
                    "id": "pName",
                    "title": "Player Name",
                    "type": "text"
                },
                {
                    "defaultValue": "Player Image",
                    "id": "pImage",
                    "title": "Player Image",
                    "type": "image"
                },
                {
                    "defaultValue": "Country",
                    "id": "pCountry",
                    "title": "Country",
                    "type": "text"
                },
                {
                    "defaultValue": "Country Flag",
                    "id": "pCountryImage",
                    "title": "Country Flag",
                    "type": "image"
                },
                {
                    "defaultValue": "Rank Average",
                    "id": "pRankAverage",
                    "title": "Rank Average",
                    "type": "text"
                },
                {
                    "defaultValue": "Rank Single",
                    "id": "pRankSingle",
                    "title": "Rank Single",
                    "type": "text"
                },
                {
                    "defaultValue": "Best Average",
                    "id": "pBestAverage",
                    "title": "Best Average",
                    "type": "text"
                },
                {
                    "defaultValue": "Best Single",
                    "id": "pBestSingle",
                    "title": "Best Single",
                    "type": "text"
                },
                {
                    "defaultValue": "Fact 1",
                    "id": "pFact1",
                    "title": "Fact 1",
                    "type": "text"
                },
                {
                    "defaultValue": "Fact 2",
                    "id": "pFact2",
                    "title": "Fact 2",
                    "type": "text"
                },
                {
                    "defaultValue": "Fact 3",
                    "id": "pFact3",
                    "title": "Fact 3",
                    "type": "text"
                },
                {
                    "defaultValue": "This Year",
                    "id": "y0Year",
                    "title": "This Year",
                    "type": "text"
                },
                {
                    "defaultValue": "Last Year",
                    "id": "y1Year",
                    "title": "Last Year",
                    "type": "text"
                },
                {
                    "defaultValue": "Two Years Ago",
                    "id": "y2Year",
                    "title": "Two Years Ago",
                    "type": "text"
                },
                {
                    "defaultValue": "This Year Average",
                    "id": "y0Average",
                    "title": "This Year Average",
                    "type": "text"
                },
                {
                    "defaultValue": "Last Year Average",
                    "id": "y1Average",
                    "title": "Last Year Average",
                    "type": "text"
                },
                {
                    "defaultValue": "Two Years Ago Average",
                    "id": "y2Average",
                    "title": "Two Years Ago Average",
                    "type": "text"
                },
                {
                    "defaultValue": "This Year Average Champs",
                    "id": "y0AverageChamps",
                    "title": "This Year Average Champs",
                    "type": "text"
                },
                {
                    "defaultValue": "Last Year Average Champs",
                    "id": "y1AverageChamps",
                    "title": "Last Year Average Champs",
                    "type": "text"
                },
                {
                    "defaultValue": "Two Years Ago Average Champs",
                    "id": "y2AverageChamps",
                    "title": "Two Years Ago Average Champs",
                    "type": "text"
                },
                {
                    "defaultValue": "This Year Average Finals",
                    "id": "y0AverageFinals",
                    "title": "This Year Average Finals",
                    "type": "text"
                },
                {
                    "defaultValue": "Last Year Average Finals",
                    "id": "y1AverageFinals",
                    "title": "Last Year Average Finals",
                    "type": "text"
                },
                {
                    "defaultValue": "Two Years Ago Average Finals",
                    "id": "y2AverageFinals",
                    "title": "Two Years Ago Average Finals",
                    "type": "text"
                }
            ]
        },
        "payload": {
            "pName": playerStats.name,
            "pImage": `https://raw.githubusercontent.com/shibumi-dan/WCA-Stream-Images/main/People/${playerStats.wcaId}.png`,//playerStats.image,
            "pBestAverage": playerStats.bestAverage,
            "pBestSingle": playerStats.bestSingle,
            "pRankAverage": playerStats.rankAverage,
            "pRankSingle": playerStats.rankSingle,
            "pCountry": playerStats.country.toLowerCase(),
            "pCountryImage": `https://raw.githubusercontent.com/lipis/flag-icons/b919a036693ee1ee0434ef5ae05f93543fc4f437/flags/4x3/${playerStats.country.toLowerCase()}.svg`,
            "pFact1": playerStats.fact1,
            "pFact2": playerStats.fact2,
            "pFact3": playerStats.fact3,
            "y0Year": playerStats.years[0].year,
            "y0Average": playerStats.years[0].average,
            "y0AverageChamps": playerStats.years[0].averageChamps,
            "y0AverageFinals": playerStats.years[0].averageFinals,
            "y1Year": playerStats.years[1].year,
            "y1Average": playerStats.years[1].average,
            "y1AverageChamps": playerStats.years[1].averageChamps,
            "y1AverageFinals": playerStats.years[1].averageFinals,
            "y2Year": playerStats.years[2].year,
            "y2Average": playerStats.years[2].average,
            "y2AverageChamps": playerStats.years[2].averageChamps,
            "y2AverageFinals": playerStats.years[2].averageFinals
        }
    }
    //console.log(json)


    var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: JSON.stringify(data),
        redirect: 'follow'
    };

    fetch("https://app.singular.live/apiv1/datanodes/6W2kVlOmw0EKLNY4eG4gmz/data", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => {
            console.log('error', error)
        });
}



function StreamUser({ eventId, person }) {

    // Render the layout even if the competition is not loaded.
    // This improves UX and also starts loading data for the actual page (like CompetitionHome).
    //const competition = data ? data.competition : null;

    return (
        <Tooltip title={`Update Stream for ${person.name}`}>
            <IconButton
                color="inherit"
                onClick={() => {
                    init(eventId, person)
                }}
                size="small"
            >
                <StreamIcon />
            </IconButton>
        </Tooltip>
    );
}

export default StreamUser;
