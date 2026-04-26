import { styled } from '@mui/material/styles';
import { Avatar } from '@mui/material';

export const Input = styled('div')(({ theme }) => ({
  cursor: 'pointer',
  borderRadius: 2,
  backgroundColor: theme.palette.grey[900],
  clipPath: `polygon(
    0 0, 0 0,
    calc(100% - 10px) 0%, 100% 10px,
    100% 100%, 100% 100%,
    10px 100%, 0% calc(100% - 10px))`,
  '&:hover': {
    backgroundColor: theme.palette.grey[700]
  }
}));

export const Dropdown = styled('ul')(({ theme }) => ({
  padding: 0,
  margin: 0,
  textIndent: 0,
  listStyle: 'none',
  '& li': {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    }
  }
}));

export const GainAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
  color: theme.palette.text.primary,
  fontSize: theme.typography.h6.fontSize
}));

export const Root = styled('div')({});

export const DisabledRoot = styled('div')({});

export const ActiveInput = styled(Input)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark
  }
}));
