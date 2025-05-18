import React, { useEffect, useState } from 'react';
import {
  Grid,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import TimeBaseStation from './TimeBaseStation';
import { SendResults } from '../../lib/singular-live'; 

function TimeBaseStations({ competitors, competitionId }) {

  const [playerData, setPlayerData] = useState([
    {
      channel: 1,
      player: null
    },
    {
      channel: 2,
      player: null
    }
  ]);

  useEffect(()=>{
    SendResults(playerData[0].player, playerData[1].player)
  }, [playerData])

  return (
    <Grid container direction="column" alignItems="center" spacing={1}>
      <Grid container item xs={12}>
          {[5,7,25,19,2,10].map((index) => (
            <Grid container item xs={12}>
              <Grid container item xs={1}>
                <Button
                    key={"Player1-" + index}
                    button
                    onClick={() => {
                      setPlayerData([
                        {
                          channel: index,
                          player: null
                        },
                        {
                          channel: playerData[1].channel,
                          player: playerData[1].player
                        }
                      ])
                    }}
                >
                  <Card
                    style={{paddingTop: 0, paddingBottom: 0, backgroundColor: playerData[0].channel === index ? "green" : "red"}}
                  >
                    <CardContent>
                      <Typography variant='h4' color={"white"}>P1</Typography>
                    </CardContent>
                  </Card>
                </Button>
              </Grid>
              <Grid container item xs={1}>
                <Button
                    key={"Player2-" + index}
                    button
                    onClick={() => {
                      setPlayerData([
                        {
                          channel: playerData[0].channel,
                          player: playerData[0].player
                        },
                        {
                          channel: index,
                          player: null
                        }
                      ])
                    }}
                >
                  <Card
                    style={{paddingTop: 0, paddingBottom: 0, backgroundColor: playerData[1].channel === index ? "green" : "red"}}
                  >
                    <CardContent>
                      <Typography variant='h4' color={"white"}>P2</Typography>
                    </CardContent>
                  </Card>
                </Button>
              </Grid>
              <Grid container item xs={10}>
                <TimeBaseStation
                  competitionId={competitionId}
                  index={index}
                  onData={(data) => {
                    if(playerData[0].channel === index){
                      setPlayerData([
                        {
                          channel: index,
                          player: data
                        },
                        {
                          channel: playerData[1].channel,
                          player: playerData[1].player
                        }
                      ])
                    } 
                    if(playerData[1].channel === index){
                      setPlayerData([
                        {
                          channel: playerData[0].channel,
                          player: playerData[0].player
                        },
                        {
                          channel: index,
                          player: data
                        }
                      ])
                    }
                    
                  }}
                />
              </Grid>
            </Grid>
          ))}
      </Grid>
    </Grid>
  );
}

export default TimeBaseStations;
