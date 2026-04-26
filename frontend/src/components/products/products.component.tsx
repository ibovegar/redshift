import React from 'react';
import { Spacecraft, Upgrade } from 'models';
import ProductCard from './product-card/product-card.component';
import { Grid } from '@mui/material';

interface Props {
  products: (Spacecraft | Upgrade)[];
  onAddClick: (product: Spacecraft | Upgrade) => void;
}

const Products = (props: Props) => {
  const { products, onAddClick } = props;

  return (
    <Grid container spacing={6}>
      {products.map((product, index) => (
        <Grid size={12} key={index}>
          <ProductCard
            product={product}
            onAddClick={() => onAddClick(product)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default Products;
