import { CheckBox, CheckBoxOutlineBlank, ExpandMore } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Typography
} from '@mui/material'
import type { ProductFilter } from 'models'
import React from 'react'

interface Props {
  title: string
  defaultExpanded?: boolean
  filters: ProductFilter[]
  onFilterClick: (filter: ProductFilter) => void
}

export const ProductFilterGroup = (props: Props) => {
  const { filters, title, onFilterClick, defaultExpanded } = props

  return (
    <Accordion defaultExpanded={defaultExpanded}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="overline">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <FormGroup sx={{ width: '100%' }}>
          {filters.map((filter, _index) => (
            <React.Fragment key={filter.id}>
              <Divider />
              <FormControlLabel
                key={filter.id}
                control={
                  <Checkbox
                    sx={{ p: '14px', ml: 4 }}
                    value={filter.value}
                    icon={<CheckBoxOutlineBlank fontSize="small" />}
                    checkedIcon={<CheckBox fontSize="small" />}
                    onChange={() => onFilterClick(filter)}
                  />
                }
                label={filter.label}
              />
            </React.Fragment>
          ))}
        </FormGroup>
      </AccordionDetails>
    </Accordion>
  )
}
