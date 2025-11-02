// src/components/AnimationControls.tsx

import React from 'react';
import { Box, IconButton, Tooltip, ButtonGroup } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';

interface AnimationControlsProps {
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isAnimating: boolean;
  isPaused: boolean;
  canStepForward: boolean;
  canStepBackward: boolean;
}

const AnimationControls: React.FC<AnimationControlsProps> = ({
  onPlay, onPause, onRestart, onNext, onPrevious,
  isAnimating, isPaused, canStepForward, canStepBackward
}) => {
  // --- NEW STYLING FOR BUTTONS ---
  const buttonSx = {
    bgcolor: 'white',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: 1.5, // Square with slightly rounded corners
    color: 'primary.main',
    '&:hover': {
      bgcolor: 'primary.light',
      color: 'white',
    },
    '&.Mui-disabled': {
      bgcolor: 'action.disabledBackground',
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Removed variant from ButtonGroup to allow for custom styling */}
      <ButtonGroup aria-label="animation controls">
        <Tooltip title="Previous Step">
          <span>
            <IconButton onClick={onPrevious} disabled={!canStepBackward} sx={buttonSx}>
              <SkipPreviousIcon />
            </IconButton>
          </span>
        </Tooltip>

        {(!isAnimating || isPaused) ? (
          <Tooltip title={isAnimating ? "Resume" : "Play"}>
            <IconButton onClick={onPlay} sx={buttonSx}>
              <PlayArrowIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Pause">
            <IconButton onClick={onPause} sx={buttonSx}>
              <PauseIcon />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Next Step">
          <span>
            <IconButton onClick={onNext} disabled={!canStepForward} sx={buttonSx}>
              <SkipNextIcon />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Restart">
          <span>
            <IconButton onClick={onRestart} sx={buttonSx}>
              <ReplayIcon />
            </IconButton>
          </span>
        </Tooltip>
      </ButtonGroup>
    </Box>
  );
};

export default AnimationControls;