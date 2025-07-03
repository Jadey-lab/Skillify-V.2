import React from 'react';
import { LinearProgress } from '@mui/material';

const ProgressTracker = ({ xp }) => {
  const maxXP = 2000; // Set your maximum XP threshold here (or dynamically adjust if needed)
  const progress = Math.min((xp / maxXP) * 100, 100); // Calculate progress as a percentage

  return (
    <div className="mt-4">
      <h4 className="text-lg font-bold">XP Progress</h4>
      <LinearProgress variant="determinate" value={progress} />
      <p className="text-center mt-2">{`${xp} / ${maxXP} XP`}</p>
    </div>
  );
};

export default ProgressTracker;
