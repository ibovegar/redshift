import { CheckBox, CheckBoxOutlineBlank, ExpandMore } from '@mui/icons-material'
import { Accordion, AccordionSummary, Divider, FormControlLabel, Typography } from '@mui/material'
import type { ProductFilter } from 'models'
import React from 'react'
import { StyledAccordionDetails, StyledCheckbox, StyledFormGroup } from './ProductFilterGroup.styles'

interface Props {
  title: string
  defaultExpanded?: boolean
  filters: ProductFilter[]
  onFilterClick: (filter: ProductFilter) => void
}

const ProductFilterGroup = (props: Props) => {
  const { filters, title, onFilterClick, defaultExpanded } = props

  return (
    <Accordion defaultExpanded={defaultExpanded}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="overline">{title}</Typography>
      </AccordionSummary>
      <StyledAccordionDetails>
        <StyledFormGroup>
          {filters.map((filter, _index) => (
            <React.Fragment key={filter.id}>
              <Divider />
              <FormControlLabel
                key={filter.id}
                control={
                  <StyledCheckbox
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
        </StyledFormGroup>
      </StyledAccordionDetails>
    </Accordion>
  )
}

export default ProductFilterGroup
