import { IconButton, Tooltip } from '@mui/material';
import StreamIcon from '@mui/icons-material/Stream';
import { formatAttemptResult } from '../../lib/attempt-result';
import { getEventName } from '../../lib/event-utils';

function getTopFacts(data, years, currentEventId) {
  const facts = [];

  const ordinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const formatWorldRankingText = (rank, type, eid, best) => {
    if (rank === 1) return `World Record ${type} in ${getEventName(eid)} (${formatSeconds(best)})`;
    if (rank === 2) return `2nd fastest ${type} in the world in ${getEventName(eid)} (${formatSeconds(best)})`;
    if (rank === 3) return `3rd fastest ${type} in the world in ${getEventName(eid)} (${formatSeconds(best)})`;
    return `Ranked ${ordinal(rank)} in the world in ${getEventName(eid)} (${formatSeconds(best)})`;
  };

  // 1. Record or ranking for SINGLE
  const single = (data.rank.singles || []).find((r) => r.eventId === currentEventId);
  if (single) {
    const r = single;
    const eid = r.eventId;
    const best = r.best;
    const rank = r.rank;

    if (rank.world === 1 || rank.continent === 1 || rank.country === 1) {
      if (rank.world === 1) {
        facts.push({
          score: 200000,
          text: formatWorldRankingText(1, "single", eid, best),
        });
      } else if (rank.continent === 1) {
        facts.push({
          score: 180000,
          text: `Continental Record single in ${getEventName(eid)} (${formatSeconds(best)})`,
        });
      } else {
        facts.push({
          score: 160000,
          text: `National Record single in ${getEventName(eid)} (${formatSeconds(best)})`,
        });
      }
    } else {
      if (rank.world < 101) {
        facts.push({
          score: 101 - rank.world / 2,
          text: formatWorldRankingText(rank.world, "single", eid, best),
        });
      } else {
        if (rank.continent < 51) {
          facts.push({
            score: 100 - rank.continent,
            text: `Ranked ${ordinal(rank.continent)} in their continent for ${getEventName(eid)} single (${formatSeconds(best)})`,
          });
        } else {
          if (rank.country < 21) {
            facts.push({
              score: 99 - rank.country,
              text: `Ranked ${ordinal(rank.country)} nationally in ${getEventName(eid)} single (${formatSeconds(best)})`,
            });
          }
        }
      }
      
      
    }
  }

  // 2. Record or ranking for AVERAGE
  const average = (data.rank.averages || []).find((r) => r.eventId === currentEventId);
  if (average) {
    const r = average;
    const eid = r.eventId;
    const best = r.best;
    const rank = r.rank;

    if (rank.world === 1 || rank.continent === 1 || rank.country === 1) {
      if (rank.world === 1) {
        facts.push({
          score: 200000,
          text: formatWorldRankingText(1, "average", eid, best),
        });
      } else if (rank.continent === 1) {
        facts.push({
          score: 180000,
          text: `Continental Record average in ${getEventName(eid)} (${formatSeconds(best)})`,
        });
      } else {
        facts.push({
          score: 160000,
          text: `National Record average in ${getEventName(eid)} (${formatSeconds(best)})`,
        });
      }
    } else {
      if (rank.country < 21) {
        facts.push({
          score: 85 - rank.country,
          text: `Ranked ${ordinal(rank.country)} nationally in ${getEventName(eid)} average (${formatSeconds(best)})`,
        });
      }
      if (rank.continent < 51) {
        facts.push({
          score: 80 - rank.continent,
          text: `Ranked ${ordinal(rank.continent)} in their continent for ${getEventName(eid)} average (${formatSeconds(best)})`,
        });
      }
      if (rank.world < 101) {
        facts.push({
          score: 75 - rank.world / 2,
          text: formatWorldRankingText(rank.world, "average", eid, best),
        });
      }
    }
  }

  // 3. Championship participation
  if (data.numberOfChampionships > 3) {
    facts.push({
      score: 30,
      text: `Participated in ${data.numberOfChampionships} official championship competitions`,
    });
  }

  // 4. Total competition participation
  facts.push({
    score: 20,
    text: `Participated in ${data.numberOfCompetitions} official competitions`,
  });

  // 5. Medals
  const { gold = 0, silver = 0, bronze = 0 } = data.medals || {};
  const total = gold + silver + bronze;
  if (total > 0) {
    facts.push({
      score: 40,
      text: `Medals: ${gold} Gold, ${silver} Silver, ${bronze} Bronze`,
    });
  }

  // 6. Most participated event
  const eventFreq = {};
  for (const comp of Object.values(data.results || {})) {
    for (const eventId of Object.keys(comp)) {
      eventFreq[eventId] = (eventFreq[eventId] || 0) + 1;
    }
  }
  const [mostEvent, mostCount] = Object.entries(eventFreq).sort((a, b) => b[1] - a[1])[0] || [];
  if (mostEvent && mostCount > 1) {
    facts.push({
      score: 10,
      text: `Most frequently competed event: ${getEventName(mostEvent)} (${mostCount} times)`,
    });
  }

  // 7. Experience milestone (based on WCA ID)
const getStartYearFromWcaId = (wcaId) => {
  const match = wcaId?.match(/^(\d{4})/);
  return match ? parseInt(match[1], 10) : null;
};

const startYear = getStartYearFromWcaId(data.id);
const currentYear = new Date().getFullYear();

if (startYear && startYear <= currentYear) {
  const years = currentYear - startYear;

  if (years >= 10) {
    facts.push({
      score: 15+ years, // high enough to often beat medals
      text: `Has been competing officially for over ${years} years`,
    });
  } else if (years > 0 && years % 5 === 0) {
    facts.push({
      score: 15 + years,
      text: `Celebrating ${years} years of official competition this year`,
    });
  }
}

  if (startYear && startYear <= currentYear) {
  facts.push({
    score: 5, // very low priority
    text: `Started competing officially in ${startYear}`,
  });
}

const thisYear = new Date(Date.now()).getFullYear();

if (Array.isArray(years) && currentEventId) {
  const history = years.filter(y => y.average && !isNaN(parseTimeToSeconds(y.average)));
  const sorted = [...history].sort((a, b) => parseInt(a.year) - parseInt(b.year));

  // 1. Best yearly average
  const best = sorted.reduce((acc, y) => {
    const avg = parseTimeToSeconds(y.average);
    return (avg < acc.value && avg > 0) ? { year: y.year, value: avg } : acc;
  }, { year: null, value: Infinity });

  if (best.year) {
    if(best.year != thisYear){
        facts.push({
        score: 35,
        text: `Best yearly average for ${getEventName(currentEventId)} was ${best.year} (${formatSeconds(best.value * 100)})`,
        });
    } else {
        facts.push({
        score: 35,
        text: `On pace for best yearly average for ${getEventName(currentEventId)} in ${best.year} (${formatSeconds(best.value * 100)})`,
    });
    }
    
  }

  // 2. Long-term improvement
  if (sorted.length >= 2) {
    const first = parseTimeToSeconds(sorted[0].average);
    const last = parseTimeToSeconds(sorted[sorted.length - 1].average);
    if (last < first && (last / first) < .9) {
      const diff = (first - last).toFixed(2);
      facts.push({
        score: 34,
        text: `Improved average for ${getEventName(currentEventId)} by ${formatSeconds(diff * 100)} from ${sorted[0].year} to ${sorted[sorted.length - 1].year}`,
      });
    }
  }

  // 3. Consecutive improvement streak
  const streak = sorted.every((val, i, arr) => i === 0 || parseTimeToSeconds(val.average) < parseTimeToSeconds(arr[i - 1].average));
  if (streak && sorted.length >= 3) {
    facts.push({
      score: 32,
      text: `Improved every year since ${sorted[0].year}`,
    });
  }

  // 4. Finals and Champs averages
  for (const y of years) {
    if (y.averageFinals && !isNaN(parseTimeToSeconds(y.averageFinals))) {
      facts.push({
        score: 30,
        text: `Final round average in ${y.year}: ${y.averageFinals}`,
      });
    }
    if (y.averageChamps && !isNaN(parseTimeToSeconds(y.averageChamps))) {
      facts.push({
        score: 30,
        text: `Championship average in ${y.year}: ${y.averageChamps}`,
      });
    }
  }
}


  facts.sort((a, b) => b.score - a.score);

  facts.push({score: 0, text: "--"});
  facts.push({score: 0, text: "--"});

  return facts.slice(0, 3).map((f) => f.text);
}

function parseTimeToSeconds(t) {
  if (typeof t !== "string") return NaN;
  const parts = t.split(":");
  if (parts.length === 1) return parseFloat(parts[0]); // "3.05"
  if (parts.length === 2) {
    const [min, sec] = parts;
    return parseInt(min, 10) * 60 + parseFloat(sec);
  }
  return NaN;
}

function getBest(arr) {
    if (arr !== undefined && arr !== null && arr.length > 0) {
        return formatSeconds(arr[0].best);
    }
    return "--";
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
                if (detail.average && detail.average > 0 ) {
                    totalAverage += detail.average;
                    count++;
                }
            });
        }
    }

    return count < 3 ? 0 : totalAverage / count;
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

    return count < 3 ? 0 : totalAverage / count;
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
                    if (detail.average && detail.average > 0 && detail.round === "Final" && (detail.position === 1 || detail.position === 2 || detail.position === 3)) {
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

    const years = [getYearlyAverages(playerData, "2025", eventId),
            getYearlyAverages(playerData, "2024", eventId),
            getYearlyAverages(playerData, "2023", eventId),
            getYearlyAverages(playerData, "2022", eventId),
            getYearlyAverages(playerData, "2021", eventId),
            getYearlyAverages(playerData, "2020", eventId),
            getYearlyAverages(playerData, "2019", eventId)]
    
    const facts = getTopFacts(playerData, years, eventId);


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
        years: years
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
            "pCountryImage": `https://raw.githubusercontent.com/mayernikd/flag-icons/refs/heads/main/flags/4x3/${playerStats.country.toLowerCase()}.svg`,
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
