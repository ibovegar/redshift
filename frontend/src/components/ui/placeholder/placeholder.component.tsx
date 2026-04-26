import React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { CardActions, Typography } from '@mui/material';

const Root = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4)
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  '&:last-child': {
    paddingBottom: theme.spacing(4)
  }
}));

const StyledCardActions = styled(CardActions)({
  display: 'flex',
  justifyContent: 'center'
});

interface Props {
  action?: React.JSX.Element;
  message: string;
}

const Placeholder = (props: Props) => {
  const { action } = props;

  return (
    <Root>
      <StyledCard>
        <StyledCardContent>
          <Typography variant="h6">{props.message}</Typography>
        </StyledCardContent>
        {action && <StyledCardActions>{props.action}</StyledCardActions>}
      </StyledCard>
    </Root>
  );
};

export default Placeholder;
