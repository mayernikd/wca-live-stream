export function getEventName(eventId){
    switch(eventId){
        case "222":
            return "2x2x2";
        case "333":
            return "3x3x3";
        case "333oh":
            return "3x3x3 One-Handed";
        case "333fm":
            return "3x3x3 Fewest Moves";
        case "333bf":
            return "3x3x3 Blindfolded";
        case "333mbf":
            return "3x3x3 Multi-Blindfolded";
        case "444":
            return "4x4x4";
        case "444bf":
            return "4x4x4 Blindfolded";
        case "555":
            return "5x5x5";
        case "555bf":
            return "5x5x5 Blindfolded";
        case "666":
            return "6x6x6";
        case "777":
            return "7x7x7";
        case "clock":
            return "Clock";
        case "minx":
            return "Megaminx";
        case "sq1":
            return "Square-1";
        case "skewb":
            return "Skewb";
        case "pyram":
            return "Pyraminx";                                                                                    
    }
}

export function getEventShortName(eventId){
    switch(eventId){
        case "222":
            return "2x2";
        case "333":
            return "3x3";
        case "333oh":
            return "3x3OH";
        case "333fm":
            return "FMC";
        case "333bf":
            return "3x3BLD";
        case "333mbf":
            return "3x3MBLD";
        case "444":
            return "4x4";
        case "444bf":
            return "4x4BLD";
        case "555":
            return "5x5";
        case "555bf":
            return "5x5BLD";
        case "666":
            return "6x6";
        case "777":
            return "7x7";
        case "clock":
            return "Clock";
        case "minx":
            return "Mega";
        case "sq1":
            return "Sq-1";
        case "skewb":
            return "Skewb";
        case "pyram":
            return "Pyra";                                                                                    
    }
}
