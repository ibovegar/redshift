import React, { ReactNode } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import Toolbar from './toolbar/toolbar.component';
import backgroundImage from 'assets/images/15.jpg';

const Background = styled('img')({
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  zIndex: -1,
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: 'cover',
  filter: 'grayscale(20%) brightness(30%)',
  transition: 'filter 0.5s ease-in-out, transform 1.2s ease-in-out',
  transform: 'scale(1.05)'
});

const TacticalWrapper = styled('div')({
  display: 'contents',
  [`& ${Background}`]: {
    transform: 'scale(1)',
    filter: 'grayscale(10%) brightness(80%)'
  }
});

interface Props extends RouteComponentProps {
  authenticated: boolean;
  credits: number;
  children: ReactNode;
}

const Layout = (props: Props) => {
  const { children, history, credits } = props;
  const isTactical = history.location.pathname === '/tactical';

  const Wrapper = isTactical ? TacticalWrapper : React.Fragment;

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        flexDirection: 'column',
        p: 6
      }}
    >
      <Wrapper>
        <Background alt=" " />
      </Wrapper>
      <Toolbar credits={credits} />
      <Box sx={{ flex: 1, mt: 6 }} style={{ minHeight: 0 }}>
        {children}
      </Box>
    </Box>
  );
};

export default withRouter(Layout);
