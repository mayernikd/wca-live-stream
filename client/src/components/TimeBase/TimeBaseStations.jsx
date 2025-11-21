import { useEffect, useState } from 'react';
import {
  Grid,
  Button,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import TimeBaseStation from './TimeBaseStation';
import { SendResults } from '../../lib/singular-live'; 
import { GetTimeBaseStation } from '../../lib/singular-live';

function TimeBaseStations({ competitionId }) {

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
          {[1,2,3,4,5,6,7,8,9,10,11,12].map((index) => (
            <Grid key={"Players-" + index} container item xs={6}>
              <Grid container item xs={1}>
                <Button
                    key={"Player1-" + index}
                    button
                    onClick={() => {
                      GetTimeBaseStation(index, (ret) => {
                        if(ret !== null){
                          setPlayerData([
                            {
                              channel: index,
                              player: JSON.parse(ret)
                            },
                            {
                              channel: playerData[1].channel,
                              player: playerData[1].player
                            }
                          ])
                        }
                      })
                      
                    }}
                >
                  <Card
                    style={{paddingTop: 0, paddingBottom: 0, backgroundColor: playerData[0].channel === index ? "green" : "grey"}}
                  >
                    <CardContent>
                      <Typography variant='h5' color={"white"}>P1</Typography>
                    </CardContent>
                  </Card>
                </Button>
              </Grid>
              <Grid container item xs={1}>
                <Button
                    key={"Player2-" + index}
                    button
                    onClick={() => {
                      GetTimeBaseStation(index, (ret) => {
                        if(ret !== null){
                          setPlayerData([
                            {
                              channel: playerData[0].channel,
                              player: playerData[0].player
                            },
                            {
                              channel: index,
                              player: JSON.parse(ret)
                            }
                          ])
                        }
                      })
                    }}
                >
                  <Card
                    style={{paddingTop: 0, paddingBottom: 0, backgroundColor: playerData[1].channel === index ? "green" : "grey"}}
                  >
                    <CardContent>
                      <Typography variant='h5' color={"white"}>P2</Typography>
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
