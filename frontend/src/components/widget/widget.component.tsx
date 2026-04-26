import React, { ReactNode } from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

const StyledCard = styled(Card)({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
});

const StyledCardContent = styled(CardContent)({
  flex: 1,
  position: 'relative'
});

interface Props {
  children: ReactNode;
}

const Widget = (props: Props) => {
  const { children } = props;

  return (
    <StyledCard>
      <StyledCardContent>{children}</StyledCardContent>
    </StyledCard>
  );
};

export default Widget;
