import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Typography, LinearProgress } from '@mui/material';

const Root = styled('div')(({ theme }) => ({
  padding: theme.spacing(2)
}));

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  onCompleted: () => void;
}

const MissionProgress = (props: Props) => {
  const { onCompleted, className, ...rest } = props;

  const [progress, setProgress] = useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          onCompleted();
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 300);

    return () => {
      clearInterval(timer);
    };
  }, [progress, onCompleted]);

  return (
    <Root className={className} {...rest}>
      <div>
        <Typography variant="h5" gutterBottom>
          MISSION IN PROGRESS
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          color="secondary"
        />
      </div>
    </Root>
  );
};

export default MissionProgress;
