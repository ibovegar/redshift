import React from 'react';
import {
  FormControlLabel,
  Typography,
  Accordion,
  AccordionSummary,
  Divider
} from '@mui/material';
import {
  StyledAccordionDetails,
  StyledFormGroup,
  StyledCheckbox
} from './product-filter-group.styles';
import {
  CheckBoxOutlineBlank,
  CheckBox,
  ExpandMore
} from '@mui/icons-material';
import { ProductFilter } from 'models';

interface Props {
  title: string;
  defaultExpanded?: boolean;
  filters: ProductFilter[];
  onFilterClick: (filter: ProductFilter) => void;
}

const ProductFilterGroup = (props: Props) => {
  const { filters, title, onFilterClick, defaultExpanded } = props;

  return (
    <Accordion defaultExpanded={defaultExpanded}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="overline">{title}</Typography>
      </AccordionSummary>
      <StyledAccordionDetails>
        <StyledFormGroup>
          {filters.map((filter, index) => (
            <React.Fragment key={index}>
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
  );
};

export default ProductFilterGroup;
