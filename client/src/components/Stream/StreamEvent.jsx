import { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Typography
} from '@mui/material';
import StreamIcon from '@mui/icons-material/Stream';
import SendTimeExtensionIcon from '@mui/icons-material/SendTimeExtension';
import { UpdateStreamRoundProjections, UpdateStreamRoundResults } from '../../lib/singular-live';

function StreamEvent({ round, projections }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectRange = (startIndex, intervalSize) => {
    console.log(`Selected startIndex=${startIndex}, interval=${intervalSize}`);
    if (projections) {
      UpdateStreamRoundProjections(round, startIndex, intervalSize);
    } else {
      UpdateStreamRoundResults(round, startIndex);
    }
    handleCloseMenu();
  };

  const totalResults = round.results.length;

  return (
    <>
      <Tooltip title={projections ? "Update Projections" : "Update Fulltext"}>
        <IconButton color="inherit" onClick={handleOpenMenu} size="large">
          {projections ? <SendTimeExtensionIcon /> : <StreamIcon />}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        {projections && <MenuItem disabled>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', opacity: 0.7 }}>
            By 8 Projections
          </Typography>
        </MenuItem>}

        {Array.from({ length: Math.ceil(totalResults / 8) }, (_, i) => {
          const start = i * 8;
          return (
            <MenuItem
              key={`by8-${start}`}
              onClick={() => handleSelectRange(start, 8)}
            >
              {start + 1} to {Math.min(start + 8, totalResults)}
            </MenuItem>
          );
        })}

        {projections && <Divider />}

        {projections && <MenuItem disabled>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', opacity: 0.7 }}>
            By 20 Projections
          </Typography>
        </MenuItem>}

        {projections && Array.from({ length: Math.ceil(totalResults / 20) }, (_, i) => {
          const start = i * 20;
          return (
            <MenuItem
              key={`by20-${start}`}
              onClick={() => handleSelectRange(start, 20)}
            >
              {start + 1} to {Math.min(start + 20, totalResults)}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

export default StreamEvent;
