import React from 'react';
import {
  StyledCard,
  StyledCardContent,
  Cover,
  Controls,
  StyledDivider,
  StyledChip
} from './product-card.styles';
import Typography from '@mui/material/Typography';
import { Spacecraft, Upgrade } from 'models';
import { Button, Box } from '@mui/material';
import { isSpacecraft } from 'utils/guards';
import { formatCurrency } from 'utils/helpers';

interface Props {
  product: Spacecraft | Upgrade;
  onAddClick: () => void;
}

const ProductCard = (props: Props) => {
  const { product, onAddClick } = props;

  const imgUrl = isSpacecraft(product)
    ? `${process.env.PUBLIC_URL}/images/spacecraft_lg/${product.spacecraftRegistry}.png`
    : `${process.env.PUBLIC_URL}/images/upgrade_lg/${product.upgradeRegistry}.png`;

  return (
    <StyledCard>
      <Cover src={imgUrl} alt="Live from space album cover" />
      <StyledCardContent>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h5">{product.name}</Typography>
          <StyledChip label={product.storeType.toUpperCase()} />
        </Box>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          {product.manufacturer}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {product.spacecraftRegistry}
        </Typography>
      </StyledCardContent>
      <Controls>
        <Typography component="h6">{formatCurrency(product.price)}</Typography>
        <StyledDivider />
        <Button
          variant="contained"
          size="small"
          color="primary"
          onClick={onAddClick}
        >
          ADD
        </Button>
      </Controls>
    </StyledCard>
  );
};

export default ProductCard;
