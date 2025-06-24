import { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Typography,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import StreamIcon from '@mui/icons-material/Stream';
import SendTimeExtensionIcon from '@mui/icons-material/SendTimeExtension';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { UpdateStreamRoundProjections, UpdateStreamRoundResults } from '../../lib/singular-live';
import { useRound } from '../../hooks/useRound';

function StreamEvent({ roundId, projections }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mode, setMode] = useState(null); // null | 'top20' | 'rotate20'
  const [countdown, setCountdown] = useState(10);

  const intervalRef = useRef(null);
  const countdownRef = useRef(null);
  const toggleTopGroupRef = useRef(false);

  const { round, refresh } = useRound(roundId);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const stopTimers = () => {
    setMode(null);
    clearInterval(intervalRef.current);
    clearInterval(countdownRef.current);
    setCountdown(15);
  };

  const startTop20 = () => {
    stopTimers();
    setMode('top20');
    setCountdown(15);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 15 : prev - 1));
    }, 1000);

    intervalRef.current = setInterval(async () => {
      const latestRound = await refresh();
      UpdateStreamRoundProjections(latestRound, 0, 20);
      console.log('Auto-refreshing Top 20');
    }, 15000);

    //inital load
    UpdateStreamRoundProjections(round, 0, 20);
  };

  const startRotate20 = () => {
    stopTimers();
    setMode('rotate20');
    setCountdown(15);
    toggleTopGroupRef.current = true;

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 15 : prev - 1));
    }, 1000);

    intervalRef.current = setInterval(async () => {
      const latestRound = await refresh();
      const startIndex = toggleTopGroupRef.current ? 20 : 0;
      UpdateStreamRoundProjections(latestRound, startIndex, 20);
      console.log(`Rotating: ${startIndex + 1} to ${startIndex + 20}`);
      toggleTopGroupRef.current = !toggleTopGroupRef.current;
    }, 15000);

    //inital load
    UpdateStreamRoundProjections(round, 0, 20);
  };

  const handleSelectRange = async (startIndex, intervalSize) => {
    const latestRound = await refresh();
    if (projections) {
      UpdateStreamRoundProjections(latestRound, startIndex, intervalSize);
    } else {
      UpdateStreamRoundResults(latestRound, startIndex);
    }
    handleCloseMenu();
  };

  useEffect(() => {
    return () => {
      stopTimers(); // cleanup on unmount
    };
  }, []);

  const renderIcon = () => {
    if (!projections) return <StreamIcon />;
    return (
      <>
        <SendTimeExtensionIcon />
        {mode && (
          <Typography
            variant="caption"
            component="span"
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              fontSize: '0.65rem',
              background: '#eee',
              px: 0.5,
              borderRadius: '4px',
            }}
          >
            {countdown}s
          </Typography>
        )}
      </>
    );
  };

  return (
    <>
      {round && (
        <>
          <Tooltip title={projections ? 'Update Projections' : 'Update Fulltext'}>
            <IconButton
              color="inherit"
              onClick={handleOpenMenu}
              size="large"
              sx={{ position: 'relative' }}
            >
              {renderIcon()}
            </IconButton>
          </Tooltip>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
            {!projections &&
              Array.from({ length: Math.ceil(round.results.length / 8) }, (_, i) => {
                const start = i * 8;
                return (
                  <MenuItem key={`by8-${start}`} onClick={() => handleSelectRange(start, 8)}>
                    {start + 1} to {Math.min(start + 8, round.results.length)}
                  </MenuItem>
                );
              })
            }

            {projections && (
              <MenuItem disabled>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', opacity: 0.7 }}>
                  By 8 Projections
                </Typography>
              </MenuItem>
            )}

            {projections &&
              Array.from({ length: Math.ceil(round.results.length / 8) }, (_, i) => {
                const start = i * 8;
                return (
                  <MenuItem key={`by8-${start}`} onClick={() => handleSelectRange(start, 8)}>
                    {start + 1} to {Math.min(start + 8, round.results.length)}
                  </MenuItem>
                );
              })
            }

            {projections && <Divider />}

            {projections && <MenuItem disabled>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', opacity: 0.7 }}>
                Timers
              </Typography>
            </MenuItem>}

            {projections && <MenuItem onClick={mode === 'top20' ? stopTimers : startTop20}>
              <ListItemIcon>
                {mode === 'top20' ? <StopIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
              </ListItemIcon>
              <ListItemText>
                {mode === 'top20' ? 'Stop Top 20 Timer' : 'Start Top 20 Timer'}
              </ListItemText>
            </MenuItem>
            }

            {projections && <MenuItem onClick={mode === 'rotate20' ? stopTimers : startRotate20}>
              <ListItemIcon>
                {mode === 'rotate20' ? <StopIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
              </ListItemIcon>
              <ListItemText>
                {mode === 'rotate20' ? 'Stop Rotation Timer' : 'Start 20/40 Rotation'}
              </ListItemText>
            </MenuItem>}

            {projections && <Divider />}

            {projections && <MenuItem disabled>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', opacity: 0.7 }}>
                By 20 Projections
              </Typography>
            </MenuItem>}
            {projections &&
              Array.from({ length: Math.ceil(round.results.length / 20) }, (_, i) => {
                const start = i * 20;
                return (
                  <MenuItem key={`by20-${start}`} onClick={() => handleSelectRange(start, 20)}>
                    {start + 1} to {Math.min(start + 20, round.results.length)}
                  </MenuItem>
                );
              })}
          </Menu>
        </>
      )}
    </>
  );
}

export default StreamEvent;
