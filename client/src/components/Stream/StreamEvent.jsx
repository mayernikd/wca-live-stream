import { useState, useEffect } from 'react';
import {
  IconButton,
  Tooltip,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import StreamIcon from '@mui/icons-material/Stream';
import SendTimeExtensionIcon from '@mui/icons-material/SendTimeExtension';
import { UpdateStreamRoundProjections, UpdateStreamRoundResults } from '../../lib/singular-live';

function StreamEvent({round, projections}) {
  const [rankRange, setRankRange] = useState(0);

  useEffect(()=>{
    //console.log(round.competitionEvent.competition.id)
    setRankRange(0);
  }, round.competitionEvent.competition.id)

  // Render the layout even if the competition is not loaded.
  // This improves UX and also starts loading data for the actual page (like CompetitionHome).
  //const competition = data ? data.competition : null;

  return (
    <>
    <Tooltip title={projections ? "Update Projections" : "Update Fulltext"}>
          <IconButton
            color="inherit"
            onClick={()=>{
              if(projections) UpdateStreamRoundProjections(round, rankRange)
              if(!projections) UpdateStreamRoundResults(round, rankRange)  
            }}
            size="large"
          >
            {projections && <SendTimeExtensionIcon /> }
            {!projections && <StreamIcon /> }
          </IconButton>
      </Tooltip>
      {!projections && <FormControl>
        <InputLabel id="demo-simple-select-label">Rank Range</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id={round.eventId}
          value={rankRange}
          label="Rank Range"
          onChange={(value)=>{ 
            console.log(value.target.value);
            setRankRange(value.target.value) 
          }}
        >
          {round.results.map((item, i)=>{
            if((i%8)===0){
              console.log(i);
              return <MenuItem key={`${round.competitionEvent.competition.id}-${i}`} value={i}>{i+1} to {i+8}</MenuItem>
            }
          })
          }
          
        </Select>
      </FormControl>}
    </>
    
  );
}

export default StreamEvent;
