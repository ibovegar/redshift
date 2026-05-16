import AddBoxIcon from '@mui/icons-material/AddBox'
import { styled } from '@mui/material/styles'

export const StyledIcon = styled(AddBoxIcon)(({ theme }) => ({
  marginRight: theme.spacing(2)
}))

export const buttonSx = {
  px: 4,
  backgroundColor: '#fff',
  color: '#000',
  position: 'relative',
  zIndex: 2,
  boxShadow: 'none',
  border: 'none',
  clipPath: 'none',
  lineHeight: 1,
  '&:hover': {
    backgroundColor: 'transparent',
    color: '#fff',
    boxShadow: 'none'
  },
  '&.active': {
    backgroundColor: 'transparent',
    color: '#fff',
    boxShadow: 'none'
  }
} as const
