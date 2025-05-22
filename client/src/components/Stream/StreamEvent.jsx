import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
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

  const handleSelectRange = (value) => {
    console.log('Selected rankRange:', value);
    if (projections) UpdateStreamRoundProjections(round, value);
    else UpdateStreamRoundResults(round, value);
    handleCloseMenu();
  };

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
        {round.results.map((item, i) => {
          if (i % 8 === 0) {
            const rangeLabel = `${i + 1} to ${i + 8}`;
            return (
              <MenuItem key={i} onClick={() => handleSelectRange(i)}>
                {rangeLabel}
              </MenuItem>
            );
          }
          return null;
        })}
      </Menu>
    </>
  );
}

export default StreamEvent;
