import React from 'react';
import { Button, ButtonGroup, Box } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ReplayIcon from '@mui/icons-material/Replay';

interface ControlsProps {
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onRestart: () => void;
  isPlaying: boolean;
}

const Controls: React.FC<ControlsProps> = ({ onPlay, onPause, onNext, onRestart, isPlaying }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', margin: 2 }}>
      <ButtonGroup variant="contained" aria-label="outlined primary button group">
        <Button onClick={isPlaying ? onPause : onPlay}>{isPlaying ? <PauseIcon /> : <PlayArrowIcon />}</Button>
        <Button onClick={onNext}><SkipNextIcon /></Button>
        <Button onClick={onRestart}><ReplayIcon /></Button>
      </ButtonGroup>
    </Box>
  );
};

export default Controls;