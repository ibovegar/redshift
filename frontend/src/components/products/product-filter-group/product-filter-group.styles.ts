import MuiAccordionDetails from '@mui/material/AccordionDetails'
import MuiCheckbox from '@mui/material/Checkbox'
import MuiFormGroup from '@mui/material/FormGroup'
import { styled } from '@mui/material/styles'

export const StyledAccordionDetails = styled(MuiAccordionDetails)({
  padding: 0
})

export const StyledFormGroup = styled(MuiFormGroup)({
  width: '100%'
})

export const StyledCheckbox = styled(MuiCheckbox)(({ theme }) => ({
  padding: 14,
  marginLeft: theme.spacing(4)
}))
